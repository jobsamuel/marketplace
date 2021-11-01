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

    expect(await market.isForSale(tokenAddress, 0)).to.equal(true)

    await market
      .connect(signers[1])
      .buyNFT(tokenAddress, 0, { value: ethers.utils.parseEther('0.01') })

    expect(await market.isForSale(tokenAddress, 0)).to.equal(false)
    expect(await market.isForSale(tokenAddress, 1)).to.equal(false)
  })

  it('Should get only NFTs for sale', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address
    const totalAssets = 5

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

    const n1 = 2

    for (let index = 0; index < n1; index++) {
      await market.connect(signers[1]).buyNFT(tokenAddress, index + 2, {
        value: ethers.utils.parseEther('0.01'),
      })
    }

    const data = await market.getAssetsForSale(0, 9)

    const tokenIdList = data.map(token => {
      return ethers.BigNumber.from(token.tokenId).toNumber()
    })

    expect(data.length).to.equal(3)

    expect(tokenIdList[0]).to.equal(0)
    expect(tokenIdList[1]).to.equal(1)
    expect(tokenIdList[2]).to.equal(4)
  })

  it('Should get batches of NFTs for sale', async function () {
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

  it('Should query all items by batches', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address
    const totalAssets = 50

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

    const n1 = 8

    for (let index = 0; index < n1; index++) {
      await market.connect(signers[1]).buyNFT(tokenAddress, index * 2, {
        value: ethers.utils.parseEther('0.01'),
      })
    }

    const batch1 = await market.getAssetsForSale(0, 10)
    expect(batch1.length).to.equal(10)

    const batch2 = await market.getAssetsForSale(10, 10)
    expect(batch2.length).to.equal(10)

    const batch3 = await market.getAssetsForSale(20, 10)
    expect(batch3.length).to.equal(10)
    expect(ethers.BigNumber.from(batch3[9].tokenId).toNumber()).to.equal(29)

    const batch4 = await market.getAssetsForSale(30, 10)
    expect(batch4.length).to.equal(10)
    expect(ethers.BigNumber.from(batch4[9].tokenId).toNumber()).to.equal(39)

    const batch5 = await market.getAssetsForSale(40, 10)
    expect(batch5.length).to.equal(10)
    expect(ethers.BigNumber.from(batch5[9].tokenId).toNumber()).to.equal(49)

    const batch6 = await market.getAssetsForSale(23, 5)
    expect(batch6.length).to.equal(5)
    expect(ethers.BigNumber.from(batch6[0].tokenId).toNumber()).to.equal(23)
    expect(ethers.BigNumber.from(batch6[4].tokenId).toNumber()).to.equal(27)

    const batch7 = await market.getAssetsForSale(50, 5)
    expect(batch7.length).to.equal(0)

    const batch8 = await market.getAssetsForSale(46, 10)
    expect(batch8.length).to.equal(4)
  })

  it('Should get NFT count in marketplace', async function () {
    const signers = await ethers.getSigners()
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy('Marketplace NFT', 'MK')
    await nft.deployed()

    const tokenAddress = nft.address
    const totalAssets = 5

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

    await market.connect(signers[1]).buyNFT(tokenAddress, 2, {
      value: ethers.utils.parseEther('0.01'),
    })

    await nft.connect(signers[1]).setApprovalForAll(market.address, true)

    for (let index = 0; index < totalAssets; index++) {
      await market
        .connect(signers[1])
        .sellNFT(tokenAddress, 2, ethers.utils.parseEther('0.01'))

      await market.connect(signers[1]).buyNFT(tokenAddress, 2, {
        value: ethers.utils.parseEther('0.01'),
      })
    }

    const batch = await market.getAllAssets(0, 9)
    expect(batch.length).to.equal(5)
  })
})
