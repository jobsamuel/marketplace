//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is IERC721Receiver, ReentrancyGuard {
    uint256 public itemsForSale = 0;
    uint256 public totalSales = 0;

    struct Token {
        address tokenAddress;
        uint256 tokenId;
    }

    struct Item {
        address seller;
        address owner;
        uint256 price;
    }

    struct Sell {
        address buyer;
        uint256 price;
    }

    Token[] private assets;

    mapping(address => mapping(uint256 => Item)) private items;
    mapping(address => mapping(uint256 => Sell[])) private history;

    event AddedToMarket(
        address indexed seller,
        address indexed owner,
        address indexed tokenAddress,
        uint256 tokenId,
        uint256 price
    );
    event RetiredFromMarket(
        address indexed seller,
        address indexed owner,
        address indexed tokenAddress,
        uint256 tokenId,
        uint256 price
    );

    function sellNFT(
        address _tokenAddress,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant returns (bool) {
        require(_price >= 0.01 ether, "Too low price.");

        Item memory item = Item({
            seller: msg.sender,
            owner: address(0),
            price: _price
        });

        Token memory nft = Token({
            tokenAddress: _tokenAddress,
            tokenId: _tokenId
        });

        items[_tokenAddress][_tokenId] = item;
        assets.push(nft);

        itemsForSale += 1;

        IERC721(_tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId
        );

        emit AddedToMarket(
            msg.sender,
            address(0),
            _tokenAddress,
            _tokenId,
            _price
        );

        return true;
    }

    function buyNFT(address _tokenAddress, uint256 _tokenId)
        external
        payable
        nonReentrant
        returns (bool)
    {
        Item memory nft = items[_tokenAddress][_tokenId];

        require(nft.price == msg.value, "Offer cannot be accepted.");

        (bool success, ) = nft.seller.call{value: msg.value}("");

        require(success, "Transaction failed.");

        items[_tokenAddress][_tokenId] = Item({
            seller: address(0),
            owner: msg.sender,
            price: 0
        });

        history[_tokenAddress][_tokenId].push(
            Sell({buyer: msg.sender, price: nft.price})
        );

        totalSales += 1;
        itemsForSale -= 1;

        IERC721(_tokenAddress).safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId
        );

        emit RetiredFromMarket(
            nft.seller,
            msg.sender,
            _tokenAddress,
            _tokenId,
            nft.price
        );

        return true;
    }

    function getItem(address _tokenAddress, uint256 _tokenId)
        external
        view
        returns (
            address seller,
            address owner,
            uint256 price
        )
    {
        Item memory nft = items[_tokenAddress][_tokenId];

        return (nft.seller, nft.owner, nft.price);
    }

    function isForSale(address _tokenAddress, uint256 _tokenId)
        external
        view
        returns (bool)
    {
        Item memory nft = items[_tokenAddress][_tokenId];

        return nft.seller != address(0);
    }

    function getAssetsForSale() external view returns (Token[] memory) {
        uint256 limit = 9;
        uint256 count = 0;

        if (limit > itemsForSale) {
            limit = itemsForSale;
        }

        Token[] memory list = new Token[](limit);

        for (uint256 index = 0; count < limit; index++) {
            Token memory nft = assets[index];
            address seller = items[nft.tokenAddress][nft.tokenId].seller;

            if (seller != address(0)) {
                list[count] = nft;
                count += 1;
            }
        }

        return list;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
