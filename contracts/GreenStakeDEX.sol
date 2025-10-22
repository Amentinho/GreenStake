// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GreenStakeDEX with Pyth Network Oracle Integration
 * @dev Decentralized energy exchange with real-time pricing from Pyth Network
 * 
 * DEPLOYMENT:
 * 1. Open https://remix.ethereum.org/
 * 2. Compile with Solidity 0.8.20+
 * 3. Deploy to Sepolia testnet - Constructor params:
 *    - _pythAddress: 0x2880aB155794e7179c9eE2e38200202908C17B43 (Pyth Sepolia)
 * 4. Copy deployed address to client/src/lib/constants.ts: CONTRACT_ADDRESS
 */

// Minimal Pyth interface for price feeds
interface IPyth {
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint publishTime;
    }
    
    function getPrice(bytes32 id) external view returns (Price memory price);
    function getPriceNoOlderThan(bytes32 id, uint age) external view returns (Price memory price);
    function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable;
    function getUpdateFee(bytes[] calldata priceUpdateData) external view returns (uint feeAmount);
}

contract GreenStakeDEX {
    // Events
    event Staked(
        address indexed user,
        uint256 amount,
        uint256 energyNeed,
        uint256 timestamp
    );
    
    event TradeExecuted(
        address indexed user,
        string fromChain,
        string toChain,
        uint256 etkAmount,
        uint256 pyusdAmount,
        uint256 energyPrice,
        uint256 timestamp
    );
    
    event TradeSettled(
        address indexed user,
        address indexed settlementAddress,
        uint256 amount,
        uint256 timestamp
    );
    
    event Withdrawn(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event EmergencyWithdrawal(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );

    event PriceUpdated(
        bytes32 indexed priceId,
        int64 price,
        uint256 timestamp
    );

    // Structs
    struct Stake {
        address user;
        uint256 amount;
        uint256 energyNeed;
        uint256 timestamp;
        bool active;
    }
    
    struct Trade {
        address user;
        string fromChain;
        string toChain;
        uint256 etkAmount;
        uint256 pyusdAmount;
        uint256 timestamp;
        bool completed;
    }

    // State variables
    mapping(address => Stake[]) public userStakes;
    mapping(address => Trade[]) public userTrades;
    mapping(address => uint256) public totalStaked;
    
    uint256 public totalValueLocked;
    uint256 public totalStakesCount;
    uint256 public totalTradesCount;
    
    address public owner;
    
    // Pyth Network integration
    IPyth public pyth;
    bytes32 public constant ETH_USD_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
    
    // Minimum stake amount (0.01 ETH)
    uint256 public constant MIN_STAKE = 0.01 ether;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor(address _pythAddress) {
        owner = msg.sender;
        pyth = IPyth(_pythAddress);
    }

    /**
     * @dev Stake ETH with energy need commitment
     * @param energyNeed Predicted energy consumption in kWh
     */
    function stake(uint256 energyNeed) external payable {
        require(msg.value >= MIN_STAKE, "Minimum stake is 0.01 ETH");
        require(energyNeed > 0, "Energy need must be greater than 0");
        
        Stake memory newStake = Stake({
            user: msg.sender,
            amount: msg.value,
            energyNeed: energyNeed,
            timestamp: block.timestamp,
            active: true
        });
        
        userStakes[msg.sender].push(newStake);
        totalStaked[msg.sender] += msg.value;
        totalValueLocked += msg.value;
        totalStakesCount++;
        
        emit Staked(msg.sender, msg.value, energyNeed, block.timestamp);
    }

    /**
     * @dev Execute cross-chain energy trade with Pyth oracle pricing
     * @param fromChain Source blockchain identifier
     * @param toChain Destination blockchain identifier
     * @param etkAmount Amount of ETK to trade (in wei)
     * @param pyusdAmount Expected PYUSD settlement amount (slippage check)
     */
    function executeTrade(
        string memory fromChain,
        string memory toChain,
        uint256 etkAmount,
        uint256 pyusdAmount
    ) external {
        require(totalStaked[msg.sender] >= etkAmount, "Insufficient staked balance");
        require(etkAmount > 0, "Trade amount must be greater than 0");
        
        // Fetch latest energy price from Pyth (using ETH/USD as proxy)
        IPyth.Price memory ethPrice = pyth.getPriceNoOlderThan(ETH_USD_PRICE_ID, 60);
        require(ethPrice.price > 0, "Invalid Pyth price");
        
        // Calculate energy rate: ETH/USD price as kWh pricing proxy
        // In production: use actual electricity price feed when available
        uint256 energyPriceUSD = uint256(int256(ethPrice.price)) / (10 ** uint256(uint256(int256(-ethPrice.expo))));
        
        // Validate PYUSD amount against oracle price (10% slippage tolerance)
        // Note: PYUSD has 6 decimals, so scale expectedPyusd by 1e6
        uint256 expectedPyusd = ((etkAmount * energyPriceUSD) / 1e18) * 1e6;
        require(
            pyusdAmount >= (expectedPyusd * 90) / 100 && 
            pyusdAmount <= (expectedPyusd * 110) / 100,
            "PYUSD amount outside acceptable range"
        );
        
        // Deduct from total staked balance and TVL
        totalStaked[msg.sender] -= etkAmount;
        totalValueLocked -= etkAmount;
        
        // Mark stakes as consumed (deactivate oldest stakes first)
        uint256 remainingToConsume = etkAmount;
        Stake[] storage stakes = userStakes[msg.sender];
        
        for (uint256 i = 0; i < stakes.length && remainingToConsume > 0; i++) {
            if (stakes[i].active) {
                if (stakes[i].amount <= remainingToConsume) {
                    remainingToConsume -= stakes[i].amount;
                    stakes[i].active = false;
                } else {
                    stakes[i].amount -= remainingToConsume;
                    remainingToConsume = 0;
                }
            }
        }
        
        Trade memory newTrade = Trade({
            user: msg.sender,
            fromChain: fromChain,
            toChain: toChain,
            etkAmount: etkAmount,
            pyusdAmount: pyusdAmount,
            timestamp: block.timestamp,
            completed: true
        });
        
        userTrades[msg.sender].push(newTrade);
        totalTradesCount++;
        
        // Transfer consumed ETH to owner for cross-chain settlement
        (bool success, ) = owner.call{value: etkAmount}("");
        require(success, "Settlement transfer failed");
        
        emit TradeExecuted(
            msg.sender,
            fromChain,
            toChain,
            etkAmount,
            pyusdAmount,
            energyPriceUSD,
            block.timestamp
        );
        
        emit TradeSettled(msg.sender, owner, etkAmount, block.timestamp);
    }

    /**
     * @dev Update Pyth price feeds (call before executeTrade for fresh prices)
     * @param priceUpdateData Price update data from Hermes API
     */
    function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable {
        uint fee = pyth.getUpdateFee(priceUpdateData);
        require(msg.value >= fee, "Insufficient fee for price update");
        
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);
        
        // Get updated price for event
        IPyth.Price memory ethPrice = pyth.getPrice(ETH_USD_PRICE_ID);
        emit PriceUpdated(ETH_USD_PRICE_ID, ethPrice.price, block.timestamp);
    }

    /**
     * @dev Get current ETH/USD price from Pyth (proxy for energy pricing)
     */
    function getCurrentEnergyPrice() external view returns (int64 price, int32 expo, uint publishTime) {
        IPyth.Price memory ethPrice = pyth.getPrice(ETH_USD_PRICE_ID);
        return (ethPrice.price, ethPrice.expo, ethPrice.publishTime);
    }

    /**
     * @dev Withdraw staked tokens - marks stakes as inactive
     * @param amount Amount to withdraw in wei
     */
    function withdraw(uint256 amount) external {
        require(totalStaked[msg.sender] >= amount, "Insufficient staked balance");
        require(amount > 0, "Withdrawal amount must be greater than 0");
        
        totalStaked[msg.sender] -= amount;
        totalValueLocked -= amount;
        
        uint256 remainingToWithdraw = amount;
        Stake[] storage stakes = userStakes[msg.sender];
        
        for (uint256 i = 0; i < stakes.length && remainingToWithdraw > 0; i++) {
            if (stakes[i].active) {
                if (stakes[i].amount <= remainingToWithdraw) {
                    remainingToWithdraw -= stakes[i].amount;
                    stakes[i].active = false;
                } else {
                    stakes[i].amount -= remainingToWithdraw;
                    remainingToWithdraw = 0;
                }
            }
        }
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Get user's stake history
     */
    function getUserStakes(address user) external view returns (Stake[] memory) {
        return userStakes[user];
    }

    /**
     * @dev Get user's trade history
     */
    function getUserTrades(address user) external view returns (Trade[] memory) {
        return userTrades[user];
    }

    /**
     * @dev Get global platform stats
     */
    function getStats() external view returns (
        uint256 tvl,
        uint256 stakesCount,
        uint256 tradesCount
    ) {
        return (totalValueLocked, totalStakesCount, totalTradesCount);
    }

    /**
     * @dev Get user's active stake balance
     */
    function getActiveStakeBalance(address user) external view returns (uint256) {
        return totalStaked[user];
    }

    /**
     * @dev Emergency withdraw (owner only)
     * NOTE: For testnet demo only. Production should use timelock + multisig.
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Emergency withdrawal failed");
        
        emit EmergencyWithdrawal(owner, balance, block.timestamp);
    }

    receive() external payable {}
}
