// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GreenStakeDEX
 * @dev Decentralized energy exchange for sustainable energy trading
 * Simplified version for immediate deployment - works with Rabby/MetaMask on Sepolia
 * 
 * DEPLOYMENT:
 * 1. Open https://remix.ethereum.org/
 * 2. Compile with Solidity 0.8.20+
 * 3. Deploy to Sepolia testnet (no constructor parameters needed)
 * 4. Copy deployed address to client/src/lib/constants.ts: CONTRACT_ADDRESS
 */

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
    
    // Minimum stake amount (0.01 ETH)
    uint256 public constant MIN_STAKE = 0.01 ether;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
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
     * @dev Execute cross-chain energy trade - consumes staked balance
     * @param fromChain Source blockchain identifier (e.g., "ethereum-sepolia")
     * @param toChain Destination blockchain identifier (e.g., "avail-testnet")
     * @param etkAmount Amount of ETK to trade (in wei)
     * @param pyusdAmount PYUSD settlement amount
     */
    function executeTrade(
        string memory fromChain,
        string memory toChain,
        uint256 etkAmount,
        uint256 pyusdAmount
    ) external {
        require(totalStaked[msg.sender] >= etkAmount, "Insufficient staked balance");
        require(etkAmount > 0, "Trade amount must be greater than 0");
        
        // Deduct from total staked balance and TVL
        totalStaked[msg.sender] -= etkAmount;
        totalValueLocked -= etkAmount;
        
        // Mark stakes as consumed (deactivate oldest stakes first)
        uint256 remainingToConsume = etkAmount;
        Stake[] storage stakes = userStakes[msg.sender];
        
        for (uint256 i = 0; i < stakes.length && remainingToConsume > 0; i++) {
            if (stakes[i].active) {
                if (stakes[i].amount <= remainingToConsume) {
                    // Fully consume this stake
                    remainingToConsume -= stakes[i].amount;
                    stakes[i].active = false;
                } else {
                    // Partially consume this stake
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
        // In production: owner bridges to Avail and settles in PYUSD
        (bool success, ) = owner.call{value: etkAmount}("");
        require(success, "Settlement transfer failed");
        
        emit TradeExecuted(
            msg.sender,
            fromChain,
            toChain,
            etkAmount,
            pyusdAmount,
            block.timestamp
        );
        
        emit TradeSettled(msg.sender, owner, etkAmount, block.timestamp);
    }

    /**
     * @dev Withdraw staked tokens - marks stakes as inactive
     * @param amount Amount to withdraw in wei
     */
    function withdraw(uint256 amount) external {
        require(totalStaked[msg.sender] >= amount, "Insufficient staked balance");
        require(amount > 0, "Withdrawal amount must be greater than 0");
        
        // Deduct from totals
        totalStaked[msg.sender] -= amount;
        totalValueLocked -= amount;
        
        // Mark stakes as inactive (withdraw from oldest stakes first)
        uint256 remainingToWithdraw = amount;
        Stake[] storage stakes = userStakes[msg.sender];
        
        for (uint256 i = 0; i < stakes.length && remainingToWithdraw > 0; i++) {
            if (stakes[i].active) {
                if (stakes[i].amount <= remainingToWithdraw) {
                    // Fully withdraw this stake
                    remainingToWithdraw -= stakes[i].amount;
                    stakes[i].active = false;
                } else {
                    // Partially withdraw this stake
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
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    receive() external payable {}
}
