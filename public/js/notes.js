let notesContract;

const notesAddress = "0xae88feb4b0a4007664ea5b9730c3469815045297";
const notesABI = [
  "function getNotes(uint256) public view returns (string[])",
  "function addNote(uint256, string) public"
];

window.onload = async () => {
  if (window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    notesContract = new ethers.Contract(notesAddress, notesABI, signer);

    console.log("✅ Connected to SavingsNotes");
    // Optionally load notes for a campaign on load
  } else {
    alert("Install MetaMask first.");
  }
};

// Example note add handler
async function addNoteToCampaign(campaignId, noteText) {
  try {
    const tx = await notesContract.addNote(campaignId, noteText);
    await tx.wait();
    alert("📝 Note added!");
  } catch (err) {
    console.error("Failed to add note:", err);
  }
}
