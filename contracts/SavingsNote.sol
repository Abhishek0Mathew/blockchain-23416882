// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SavingsNotes {
    // Maps campaign ID to an array of notes
    mapping(uint => string[]) public notes;

    // Add a note to a campaign
    function addNote(uint campaignId, string calldata text) public {
        require(bytes(text).length > 0, "Note cannot be empty");
        notes[campaignId].push(text);
    }

    // Get all notes for a specific campaign
    function getNotes(uint campaignId) public view returns (string[] memory) {
        return notes[campaignId];
    }

    // Optional: get number of notes
    function getNoteCount(uint campaignId) public view returns (uint) {
        return notes[campaignId].length;
    }
}
