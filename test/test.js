const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Marketplace', function () {
  it('Should handle single item sell', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address

    await nft.createNFT('demo.marketplace.0')

    expect(await nft.ownerOf(0)).to.equal(signers[0].address)

    const Marketplace = await ethers.getContractFactory('Marketplace')
    const market = await Marketplace.deploy()
    await market.deployed()

    await nft.approve(market.address, 0)

    await market.sellNFT(tokenAddress, 0, ethers.utils.parseEther('0.01'))

    expect(await nft.ownerOf(0)).to.equal(market.address)

    await nft.createNFT('demo.marketplace.1')

    expect(await nft.ownerOf(1)).to.equal(signers[0].address)

    await expect(
      market.sellNFT(tokenAddress, 1, ethers.utils.parseEther('0.01'))
    ).to.be.revertedWith('ERC721: transfer caller is not owner nor approved')

    expect(await nft.ownerOf(1)).to.equal(signers[0].address)
  })

  it('Should handle single item buy', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address

    await nft.createNFT('demo.marketplace.0')

    const Marketplace = await ethers.getContractFactory('Marketplace')
    const market = await Marketplace.deploy()
    await market.deployed()

    await nft.approve(market.address, 0)

    await market.sellNFT(tokenAddress, 0, ethers.utils.parseEther('0.01'))

    await expect(
      market
        .connect(signers[1])
        .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.009') })
    ).to.be.revertedWith('Offer cannot be accepted.')

    await expect(
      market
        .connect(signers[1])
        .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.02') })
    ).to.be.revertedWith('Offer cannot be accepted.')

    await market
      .connect(signers[1])
      .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.01') })

    await expect(
      market
        .connect(signers[2])
        .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.01') })
    ).to.be.reverted

    expect(await nft.ownerOf(0)).to.equal(signers[1].address)
  })

  it('Should get NFT info before and after being bought', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address

    await nft.createNFT('demo.marketplace.0')

    const Marketplace = await ethers.getContractFactory('Marketplace')
    const market = await Marketplace.deploy()
    await market.deployed()

    await nft.approve(market.address, 0)

    await market.sellNFT(tokenAddress, 0, ethers.utils.parseEther('0.01'))

    const data0 = await market.getItem(tokenAddress, 0)

    expect(data0.seller).to.equal(signers[0].address)
    expect(data0.owner).to.equal('0x0000000000000000000000000000000000000000')
    expect(data0.price).to.equal(ethers.utils.parseEther('0.01'))

    await market
      .connect(signers[1])
      .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.01') })

    const data1 = await market.getItem(tokenAddress, 0)

    expect(data1.seller).to.equal('0x0000000000000000000000000000000000000000')
    expect(data1.owner).to.equal(signers[1].address)
    expect(data1.price).to.equal(0)
  })

  it('Should check if NFT is for sale', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address

    await nft.createNFT('demo.marketplace.0')

    const Marketplace = await ethers.getContractFactory('Marketplace')
    const market = await Marketplace.deploy()
    await market.deployed()

    await nft.approve(market.address, 0)

    await market.sellNFT(tokenAddress, 0, ethers.utils.parseEther('0.01'))

    const data1 = await market.isForSale(tokenAddress, 0)

    expect(data1).to.be.true

    await market
      .connect(signers[1])
      .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.01') })

    const data2 = await market.isForSale(tokenAddress, 0)
    expect(data2).to.be.false

    const data3 = await market.isForSale(tokenAddress, 1)
    expect(data3).to.be.false
  })

  it('Should get batches of assets for sale', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address
    const totalAssets = 15

    for (let index = 0; index < totalAssets; index++) {
      await nft.createNFT('demo.marketplace.' + index)
    }

    const Marketplace = await ethers.getContractFactory('Marketplace')
    const market = await Marketplace.deploy()
    await market.deployed()

    await nft.setApprovalForAll(market.address, true)

    for (let index = 0; index < totalAssets; index++) {
      await market.sellNFT(tokenAddress, index, ethers.utils.parseEther('0.01'))
    }

    const n1 = 4

    for (let index = 0; index < n1; index++) {
      await market.connect(signers[1]).buyNFT(tokenAddress, index + 2, {
        value: ethers.utils.parseEther('0.01'),
      })
    }

    const batch1 = await market.getAssetsForSale(0, 9)
    const tokenIdListFromFirstBatch = batch1.map(token => {
      return ethers.BigNumber.from(token.tokenId).toNumber()
    })

    expect(batch1.length).to.equal(9)

    expect(tokenIdListFromFirstBatch[0]).to.equal(0)
    expect(tokenIdListFromFirstBatch[1]).to.equal(1)
    expect(tokenIdListFromFirstBatch[2]).to.equal(6)
    expect(tokenIdListFromFirstBatch[3]).to.equal(7)
    expect(tokenIdListFromFirstBatch[4]).to.equal(8)
    expect(tokenIdListFromFirstBatch[5]).to.equal(9)
    expect(tokenIdListFromFirstBatch[6]).to.equal(10)
    expect(tokenIdListFromFirstBatch[7]).to.equal(11)
    expect(tokenIdListFromFirstBatch[8]).to.equal(12)

    const batch2 = await market.getAssetsForSale(
      tokenIdListFromFirstBatch[8],
      9
    )
    expect(batch2.length).to.equal(3)

    const batch3 = await market.getAssetsForSale(2, 4)
    const tokenIdListFromSecondBatch = batch3.map(token => {
      return ethers.BigNumber.from(token.tokenId).toNumber()
    })

    expect(batch3.length).to.equal(4)

    expect(tokenIdListFromSecondBatch[0]).to.equal(6)
    expect(tokenIdListFromSecondBatch[1]).to.equal(7)
    expect(tokenIdListFromSecondBatch[2]).to.equal(8)
    expect(tokenIdListFromSecondBatch[3]).to.equal(9)
  })
})
