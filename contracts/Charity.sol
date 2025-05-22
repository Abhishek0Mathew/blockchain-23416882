// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./VaultToken.sol";  // Ensure this file is present and compiled

contract SavingsVault {
    struct Campaign {
        string name;
        string description;
        address payable owner;
        uint goal;
        uint totalDonated;
        bool withdrawn;
        mapping(address => uint) contributors;
        address[] contributorList;
    }

    Campaign[] public campaigns;
    VaultToken public token;

    constructor(address _tokenAddress) {
        token = VaultToken(_tokenAddress);
    }

    event CampaignCreated(uint campaignId, string name, address owner);
    event DonationReceived(uint campaignId, address donor, uint amount);
    event FundsWithdrawn(uint campaignId, uint amount);

    function createCampaign(string memory _name, string memory _description, uint _goal) public {
        campaigns.push();
        Campaign storage c = campaigns[campaigns.length - 1];
        c.name = _name;
        c.description = _description;
        c.owner = payable(msg.sender);
        c.goal = _goal;
        emit CampaignCreated(campaigns.length - 1, _name, msg.sender);
    }

    function donateToCampaign(uint _id) public payable {
        require(_id < campaigns.length, "Invalid campaign");
        require(msg.value > 0, "Must send ETH");

        Campaign storage c = campaigns[_id];

        if (c.contributors[msg.sender] == 0) {
            c.contributorList.push(msg.sender);
        }

        c.contributors[msg.sender] += msg.value;
        c.totalDonated += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);
    }

    function withdrawFunds(uint _id) public {
        Campaign storage c = campaigns[_id];
        require(msg.sender == c.owner, "Only owner can withdraw");
        require(c.totalDonated >= c.goal, "Goal not reached");
        require(!c.withdrawn, "Already withdrawn");

        c.withdrawn = true;
        c.owner.transfer(c.totalDonated);

        // ✅ Mint reward tokens to the user (e.g., 100 VAULT tokens)
        token.mint(msg.sender, 100 * 10 ** 18);

        emit FundsWithdrawn(_id, c.totalDonated);
    }

    function getCampaign(uint _id) public view returns (string memory, string memory, address, uint, uint, bool) {
        Campaign storage c = campaigns[_id];
        return (c.name, c.description, c.owner, c.goal, c.totalDonated, c.withdrawn);
    }

    function getCampaignCount() public view returns (uint) {
        return campaigns.length;
    }

    function getContributors(uint _id) public view returns (address[] memory) {
        return campaigns[_id].contributorList;
    }

    function getContribution(uint _id, address _addr) public view returns (uint) {
        return campaigns[_id].contributors[_addr];
    }
    function getTokenAddress() public view returns (address) {
    return address(token);
}
}
