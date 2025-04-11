let provider, signer, contract;
const contractAddress = "0x4955edd64cead2a375d249351092f04bcae2b916";
const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "campaignId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "CampaignCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "campaignId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "donor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "DonationReceived",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "campaignId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FundsWithdrawn",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_goal",
				"type": "uint256"
			}
		],
		"name": "createCampaign",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "donateToCampaign",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "withdrawFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "campaigns",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "address payable",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "goal",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalDonated",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "withdrawn",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCampaigns",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "address payable",
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "goal",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalDonated",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "withdrawn",
						"type": "bool"
					}
				],
				"internalType": "struct Charity.Campaign[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

window.onload = async () => {
	const connectBtn = document.getElementById("connectBtn");
	const walletDisplay = document.getElementById("wallet");
	const loginStatus = document.getElementById("loginStatus"); // Make sure this exists in HTML
  
	connectBtn.onclick = async () => {
	  if (typeof window.ethereum === "undefined") {
		alert("Please install MetaMask");
		return;
	  }
  
	  try {
		// Request wallet connection
		await window.ethereum.request({ method: "eth_requestAccounts" });
  
		provider = new ethers.providers.Web3Provider(window.ethereum);
		signer = provider.getSigner();
		const address = await signer.getAddress();
  
		// Format: 0xAbC...1234
		const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  
		walletDisplay.innerText = "Connected: " + shortAddress;
		loginStatus.innerText = `Welcome, ${shortAddress}`;
		loginStatus.classList.remove("text-muted");
		loginStatus.classList.add("text-primary");
  
		// Set up contract
		contract = new ethers.Contract(contractAddress, contractABI, signer);
  
		// Load existing goals
		loadCampaigns();
	  } catch (err) {
		console.error("MetaMask connection failed:", err);
		alert(" Connection failed. Check console.");
	  }
	};
  };
  

  async function loadCampaigns() {
	console.log("🔁 loadCampaigns() called");
  
	const container = document.getElementById("campaignList");
	container.innerHTML = "⏳ Loading savings goals...";
  
	try {
	  const campaigns = await contract.getCampaigns();
	  console.log("📦 Campaigns fetched:", campaigns);
  
	  if (campaigns.length === 0) {
		container.innerHTML = "<p class='text-muted'>No savings goals found. Be the first to create one!</p>";
		return;
	  }
  
	  const ethUsd = await getEthUsd();
	  container.innerHTML = ""; // Clear previous content
  
	  const address = await signer.getAddress(); // Current user address
  
	  campaigns.forEach((c, i) => {
		const goalBN = ethers.BigNumber.from(c.goal);
		const raisedBN = ethers.BigNumber.from(c.totalDonated);
  
		// ✅ Skip completed or withdrawn goals
		if (c.withdrawn || raisedBN.gte(goalBN)) return;
  
		const goalETH = ethers.utils.formatEther(c.goal);
		const raisedETH = ethers.utils.formatEther(c.totalDonated);
  
		const goalUSD = (parseFloat(goalETH) * ethUsd).toFixed(2);
		const raisedUSD = (parseFloat(raisedETH) * ethUsd).toFixed(2);
		const progressPercent = ((parseFloat(raisedETH) / parseFloat(goalETH)) * 100).toFixed(1);
  
		const card = document.createElement("div");
		card.className = "col-md-4 mb-3";
  
		card.innerHTML = `
		  <div class="card h-100 shadow-sm">
			<div class="card-body d-flex flex-column justify-content-between">
			  <div>
				<h5 class="card-title">${c.name}</h5>
				<p class="card-text">${c.description}</p>
				<p><strong>Target:</strong> ${goalETH} ETH (~$${goalUSD})</p>
				<p><strong>Saved:</strong> ${raisedETH} ETH (~$${raisedUSD})</p>
  
				<div class="progress mb-3" style="height: 20px;">
				  <div class="progress-bar bg-success" role="progressbar" style="width: ${progressPercent}%;">
					${progressPercent}%
				  </div>
				</div>
			  </div>
  
			  <button class="btn btn-success w-100 mt-auto" onclick="donate(${i})">
				<i class="bi bi-plus-circle"></i> Add to Savings
			  </button>
			</div>
		  </div>
		`;
  
		container.appendChild(card);
	  });
  
	} catch (err) {
	  console.error("⚠️ Error loading campaigns:", err);
	  container.innerHTML = `<p class='text-danger'>Failed to load savings goals. Check console for details.</p>`;
	}
  }
  
  
  

  async function getEthUsd() {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await res.json();
      return data.ethereum.usd;
    } catch (err) {
      console.error("Failed to fetch ETH price:", err);
      return 0;
    }
  }

async function donate(id) {
  const ethAmount = prompt("Enter ETH amount to save:");
  const tx = await contract.donateToCampaign(id, {
    value: ethers.utils.parseEther(ethAmount)
  });
  await tx.wait();
  alert("Your ETH has been saved");
  loadCampaigns();
}

document.getElementById("createForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // 🔐 Prevent form from refreshing the page
  
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const goalEth = document.getElementById("goal").value;
  
    const goalWei = ethers.utils.parseEther(goalEth);
  
    try {
      const tx = await contract.createCampaign(name, description, goalWei);
      await tx.wait();
  
      alert(" Goal has been created successfully!");
      this.reset(); // Reset form fields
      loadCampaigns(); // 🔁 Refresh the campaign list
    } catch (err) {
      console.error("🚫 Error creating Goal:", err);
      alert("❌ Error creating goal. Check console.");
    }
  });
  
  document.addEventListener("DOMContentLoaded", () => {
	const toggleBtn = document.getElementById("toggleThemeBtn");
	const isDark = localStorage.getItem("theme") === "dark";
  
	if (isDark) {
	  document.body.classList.add("dark-mode");
	  toggleBtn.innerHTML = '<i class="bi bi-sun"></i> Light Mode';
	}
  
	toggleBtn.addEventListener("click", () => {
	  document.body.classList.toggle("dark-mode");
	  const darkMode = document.body.classList.contains("dark-mode");
  
	  toggleBtn.innerHTML = darkMode
		? '<i class="bi bi-sun"></i> Light Mode'
		: '<i class="bi bi-moon"></i> Night Mode';
  
	  localStorage.setItem("theme", darkMode ? "dark" : "light");
	});
  });
  