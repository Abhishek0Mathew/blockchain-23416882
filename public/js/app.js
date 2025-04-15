let provider, signer, contract;
const contractAddress = "0x197efd29337dc28670183fef3eb93c1e955c112e";
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getCampaign",
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
				"internalType": "address",
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
		"name": "getCampaignCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_addr",
				"type": "address"
			}
		],
		"name": "getContribution",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
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
		"name": "getContributors",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
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
	  const campaignCount = await contract.getCampaignCount();
	  console.log("📦 Campaign count:", campaignCount);
  
	  if (campaignCount === 0) {
		container.innerHTML = "<p class='text-muted'>No savings goals found. Be the first to create one!</p>";
		return;
	  }
  
	  const ethUsd = await getEthUsd();
	  container.innerHTML = ""; // Clear previous content
	  const address = await signer.getAddress();
  
	  for (let i = 0; i < campaignCount; i++) {
		const [name, description, owner, goal, totalDonated, withdrawn] = await contract.getCampaign(i);

		if (withdrawn) continue; //  Skip rendering withdrawn goals

		const goalBN = ethers.BigNumber.from(goal);
		const raisedBN = ethers.BigNumber.from(totalDonated);
  
		const goalETH = ethers.utils.formatEther(goal);
		const raisedETH = ethers.utils.formatEther(totalDonated);
		const goalUSD = (parseFloat(goalETH) * ethUsd).toFixed(2);
		const raisedUSD = (parseFloat(raisedETH) * ethUsd).toFixed(2);
		const progressPercent = ((parseFloat(raisedETH) / parseFloat(goalETH)) * 100).toFixed(1);
  
		// 🔍 Contributors (optional)
		const contributorAddresses = await contract.getContributors(i);
		let contributorsHtml = "";
		for (const addr of contributorAddresses) {
		  const amount = await contract.getContribution(i, addr);
		  const ethAmount = ethers.utils.formatEther(amount);
		  contributorsHtml += `<li>${addr.slice(0, 6)}...${addr.slice(-4)} – ${ethAmount} ETH</li>`;
		}
  
		// ✅ Determine button based on role + status
		let actionButton = `
		  <button class="btn btn-success w-100 mt-auto" onclick="donate(${i})">
			<i class="bi bi-plus-circle"></i> Add to Savings
		  </button>
		`;
  
		if (
		  address.toLowerCase() === owner.toLowerCase() &&
		  raisedBN.gte(goalBN) &&
		  !withdrawn
		) {
		  actionButton = `
			<button class="btn btn-warning w-100 mt-auto" onclick="withdraw(${i})">
			  <i class="bi bi-unlock"></i> Withdraw Funds
			</button>
		  `;
		}
  
		const card = document.createElement("div");
		card.className = "col-md-4 mb-3";
  
		card.innerHTML = `
 		 <div class="card h-100 shadow-sm">
   			 <div class="card-body d-flex flex-column justify-content-between">
      			<div>
        			<h5 class="card-title">${name} <span class="text-muted fs-6">(ID: ${i})</span></h5>
					<p class="card-text">${description}</p>
        			<p><strong>Target:</strong> ${goalETH} ETH (~$${goalUSD})</p>
        			<p><strong>Saved:</strong> ${raisedETH} ETH (~$${raisedUSD})</p>

       				 <div class="progress mb-3" style="height: 20px;">
          				<div class="progress-bar bg-success" role="progressbar" style="width: ${progressPercent}%;">
            				${progressPercent}%
          			</div>
        		</div>

        		<div>
         		 <strong>Contributors:</strong>
          		 <ul class="small text-muted mb-2">${contributorsHtml}</ul>
        	</div>
      	  </div>

      	  ${actionButton}
    	</div>
  	  </div>
	`;
  
		container.appendChild(card);
	  }
  
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
	  return 0; // fallback
	}
  }

  async function withdraw(id) {
	try {
	  const tx = await contract.withdrawFunds(id);
	  await tx.wait();
	  alert("✅ Funds withdrawn!");
	  loadCampaigns(); // Refresh list
	} catch (err) {
	  console.error("❌ Withdraw failed:", err);
	  alert("Withdrawal failed. See console.");
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
  