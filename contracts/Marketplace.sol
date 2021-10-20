//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is IERC721Receiver, ReentrancyGuard {
    struct Item {
        address seller;
        address owner;
        uint256 price;
    }

    struct Sell {
        address buyer;
        uint256 price;
    }

    mapping(address => mapping(uint256 => Item)) private assets;
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
        require(_price >= 0.01 ether, "NFT price too low.");

        Item memory nft = Item({
            seller: msg.sender,
            owner: address(0),
            price: _price
        });

        assets[_tokenAddress][_tokenId] = nft;

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
        Item memory nft = assets[_tokenAddress][_tokenId];

        require(nft.price == msg.value, "Price not met.");

        (bool success, ) = nft.seller.call{value: msg.value}("");

        require(success, "Transaction failed.");

        assets[_tokenAddress][_tokenId] = Item({
            seller: address(0),
            owner: msg.sender,
            price: 0
        });

        history[_tokenAddress][_tokenId].push(
            Sell({buyer: msg.sender, price: nft.price})
        );

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

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
