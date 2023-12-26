const lotteryAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
const abi = [
	{
		"inputs": [],
		"name": "enter",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pickWinner",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "winnings",
				"type": "uint256"
			}
		],
		"name": "WinnerSelected",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getParticipants",
		"outputs": [
			{
				"internalType": "address payable[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "manager",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
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
		"name": "participants",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "winner",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "winnings",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}

];



const lotteryContract = new ethers.Contract(lotteryAddress, abi, signer);
let walletAddress = null;
let provider = null;
let signer = null;
let contract = null;


async function refreshParticipants() {
    const participantsElement = document.getElementById('participantsList');
    const participants = await lotteryContract.getParticipants();
    participantsElement.innerHTML = participants.map(p => `<li>${p}</li>`).join('');
}

async function refreshAccounts() {
    const accountsElement = document.getElementById('accounts');
    let accounts = await provider.listAccounts();
    accounts = accounts.slice(0,8);
    accounts = accounts.map(x => [x, 0]);
    for (let idx = 0; idx < accounts.length; idx++) {
        const element = accounts[idx];
        accounts[idx][1] = ethers.utils.formatEther(
            await provider.getBalance(element[0])
        )
    }
    accountsElement.innerHTML = accounts.map((obj,idx) => `<tr><td>Number ${idx+1}</td><td>${obj[0]}</td><td>${obj[1]} ETH</td></tr>`).join('');
}

async function connect() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            walletAddress = (await window.ethereum.request({ method: 'eth_accounts' }))[0];
            document.getElementById('connectWallet').innerText = 'Connected';
            if (accounts && accounts.length > 0) {
                const truncatedAddress = `${accounts[0].slice(0, 5)}...${accounts[0].slice(-5)}`;
                document.getElementById('connectWallet').innerText = `Connected (${truncatedAddress})`;
                document.getElementById('connectWallet').disabled = true;
            }
            //provider = new ethers.providers.Web3Provider(window.ethereum);
            provider = new ethers.getDefaultProvider(network)
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            console.log('Wallet Connected');
            console.log("First 5 characters:", accounts[0].slice(0, 5));
            console.log("Last 5 characters:", accounts[0].slice(-5));
        } 
        catch (error) {
            console.error(error);
            document.getElementById('connectWallet').innerText = 'Wallet Connection Failed';
        }
    } else {
        alert('MetaMask extension not detected. Please install MetaMask and try again.');
    }
}

async function enterLottery() {
    const addressInput = document.getElementById('address');
    const userAddress = addressInput.value;

    try {
        const userSigner = provider.getSigner(userAddress);
        const userLotteryContract = new ethers.Contract(lotteryAddress, abi, userSigner);

        const tx = await userLotteryContract.enter({
            value: ethers.utils.parseEther('1')
        });
        await tx.wait();

        alert(`Entered the lottery from address ${userAddress}`);
        addressInput.value = '';
        refreshParticipants();
    } catch (error) {
        alert('Error entering lottery:', error.message);
    }
}

async function pickWinner() {
    try {
        const tx = await lotteryContract.pickWinner();
        const receipt = await tx.wait();

        const winnerEvent = lotteryContract.interface.parseLog(receipt.logs[0]);
        const winnerAddress = winnerEvent.args[0];

        alert(`Picked the winner: ${winnerAddress}`);
        refreshParticipants();
        refreshAccounts();
    } catch (error) {
        console.log(error)
        alert('Error picking winner:', error);
    }
}

refreshParticipants();
refreshAccounts();