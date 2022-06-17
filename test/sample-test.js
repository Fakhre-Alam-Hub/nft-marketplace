const { expect } = require("chai");
const { ethers } = require("hardhat");

/* test/sample-test.js */
describe("NFTMarketplace", function () {
  it("Should create and execute market sales", async function () {
    /* deploy the marketplace */
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace")
    const nftMarketplace = await NFTMarketplace.deploy()
    await nftMarketplace.deployed()

    const marketaddress = await nftMarketplace.address

    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketaddress)
    await nft.deployed()
    const nftContractAddress = await nft.address

    let listingPrice = await nftMarketplace.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('100', 'ether')

    /* create two tokens */
    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com")

    await nftMarketplace.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice })
    await nftMarketplace.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice })

    const [_, buyerAddress] = await ethers.getSigners()

    /* execute sale of token to another user */
    await nftMarketplace.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice })

    let items = await nftMarketplace.fetchMarketItems()

    items = await Promise.all(items.map(async i =>{
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item =  {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))

    console.log('items: ', items)

  });
});