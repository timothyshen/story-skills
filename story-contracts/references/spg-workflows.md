# SPG Workflow Contracts

Story Protocol Gateway (SPG) workflow contracts batch multiple core protocol operations into single transactions. They are periphery contracts that sit on top of the core protocol.

## WorkflowStructs

All SPG workflow contracts share common structs defined in `WorkflowStructs`:

```solidity
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";
```

### IPMetadata

```solidity
struct IPMetadata {
    string ipMetadataURI;       // IPFS URI for IP metadata JSON (Story IPA standard)
    bytes32 ipMetadataHash;     // SHA-256 hash of the IP metadata JSON
    string nftMetadataURI;      // IPFS URI for NFT metadata JSON (ERC-721/OpenSea)
    bytes32 nftMetadataHash;    // SHA-256 hash of the NFT metadata JSON
}
```

### MakeDerivative

```solidity
struct MakeDerivative {
    address[] parentIpIds;          // Array of parent IP Account addresses
    uint256[] licenseTermsIds;      // License terms IDs (one per parent, matched by index)
    address licenseTemplate;        // License template address (usually PILicenseTemplate)
    bytes royaltyContext;           // Extra royalty context (usually empty "")
    uint256 maxMintingFee;          // Max minting fee to pay (0 = unlimited)
    uint256 maxRts;                 // Max royalty tokens (0 = unlimited)
    uint256 maxRevenueShare;        // Max revenue share (0 = unlimited)
}
```

### SignatureData

```solidity
struct SignatureData {
    address signer;     // Address that created the signature
    uint256 deadline;   // Unix timestamp after which signature is invalid
    bytes signature;    // EIP-712 typed signature bytes
}
```

### RoyaltyShare

```solidity
struct RoyaltyShare {
    address recipient;      // Address receiving royalty vault tokens
    uint32 percentage;      // Percentage of royalty tokens (in basis points, e.g., 1000 = 10%)
}
```

## RegistrationWorkflows

**Address:** `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424`
**Import:** `@story-protocol/periphery/workflows/RegistrationWorkflows.sol`

### Functions

```solidity
/// @notice Mints an NFT from an SPGNFT collection and registers it as an IP Asset.
/// @param spgNftContract The SPGNFT collection to mint from.
/// @param recipient Address to receive the minted NFT.
/// @param ipMetadata IP and NFT metadata URIs and hashes.
/// @param allowDuplicates If false, reverts on duplicate registration.
/// @return ipId The IP Account address.
/// @return tokenId The minted NFT token ID.
function mintAndRegisterIp(
    address spgNftContract,
    address recipient,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    bool allowDuplicates
) external returns (address ipId, uint256 tokenId);

/// @notice Registers an existing NFT as an IP Asset (requires EIP-712 signatures).
/// @param nftContract The ERC-721 contract address.
/// @param tokenId The token ID.
/// @param ipMetadata IP and NFT metadata.
/// @param sigMetadata Signature authorizing metadata setting.
/// @param sigRegister Signature authorizing registration.
/// @return ipId The IP Account address.
function registerIp(
    address nftContract,
    uint256 tokenId,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    WorkflowStructs.SignatureData calldata sigMetadata,
    WorkflowStructs.SignatureData calldata sigRegister
) external returns (address ipId);

/// @notice Creates a new SPGNFT collection.
/// @param spgNftInitParams The initialization parameters for the collection.
/// @return spgNftContract The deployed SPGNFT collection address.
function createCollection(
    ISPGNFT.InitParams calldata spgNftInitParams
) external returns (address spgNftContract);

/// @notice Built-in multicall for batching multiple calls.
/// @param data Array of encoded function calls.
/// @return results Array of return data from each call.
function multicall(bytes[] calldata data) external returns (bytes[] memory results);
```

### Usage: Mint and Register

```solidity
import { RegistrationWorkflows } from "@story-protocol/periphery/workflows/RegistrationWorkflows.sol";
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";

RegistrationWorkflows public constant REG =
    RegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424);

function mintAndRegister(address spgNft, address recipient) external returns (address, uint256) {
    (address ipId, uint256 tokenId) = REG.mintAndRegisterIp(
        spgNft,
        recipient,
        WorkflowStructs.IPMetadata({
            ipMetadataURI: "ipfs://QmIPMetadata...",
            ipMetadataHash: keccak256("..."),  // In practice, use SHA-256
            nftMetadataURI: "ipfs://QmNFTMetadata...",
            nftMetadataHash: keccak256("...")
        }),
        true // allowDuplicates
    );
    return (ipId, tokenId);
}
```

## DerivativeWorkflows

**Address:** `0x9e2d496f72C547C2C535B167e06ED8729B374a4f`
**Import:** `@story-protocol/periphery/workflows/DerivativeWorkflows.sol`

### Functions

```solidity
/// @notice Mints NFT + registers IP + links as derivative of parent IPs.
/// @param spgNftContract The SPGNFT collection to mint from.
/// @param derivData Parent IPs and license terms for the derivative relationship.
/// @param ipMetadata IP and NFT metadata.
/// @param recipient Address to receive the minted NFT.
/// @param allowDuplicates If false, reverts on duplicate.
/// @return ipId The child IP Account address.
/// @return tokenId The minted NFT token ID.
function mintAndRegisterIpAndMakeDerivative(
    address spgNftContract,
    WorkflowStructs.MakeDerivative calldata derivData,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    address recipient,
    bool allowDuplicates
) external returns (address ipId, uint256 tokenId);

/// @notice Registers existing NFT + makes it a derivative (requires signatures).
function registerIpAndMakeDerivative(
    address nftContract,
    uint256 tokenId,
    WorkflowStructs.MakeDerivative calldata derivData,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    WorkflowStructs.SignatureData calldata sigMetadata,
    WorkflowStructs.SignatureData calldata sigRegister
) external returns (address ipId);

/// @notice Registers existing NFT + makes derivative using license tokens.
function registerIpAndMakeDerivativeWithLicenseTokens(
    address nftContract,
    uint256 tokenId,
    uint256[] calldata licenseTokenIds,
    bytes calldata royaltyContext,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    WorkflowStructs.SignatureData calldata sigMetadata,
    WorkflowStructs.SignatureData calldata sigRegister
) external returns (address ipId);

/// @notice Built-in multicall.
function multicall(bytes[] calldata data) external returns (bytes[] memory results);
```

### Usage: Create a Derivative

```solidity
import { DerivativeWorkflows } from "@story-protocol/periphery/workflows/DerivativeWorkflows.sol";
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";

DerivativeWorkflows public constant DERIV =
    DerivativeWorkflows(0x9e2d496f72C547C2C535B167e06ED8729B374a4f);

function createDerivative(
    address spgNft,
    address parentIpId,
    uint256 parentTermsId,
    address recipient
) external returns (address, uint256) {
    address[] memory parents = new address[](1);
    parents[0] = parentIpId;

    uint256[] memory termsIds = new uint256[](1);
    termsIds[0] = parentTermsId;

    (address childIpId, uint256 tokenId) = DERIV.mintAndRegisterIpAndMakeDerivative(
        spgNft,
        WorkflowStructs.MakeDerivative({
            parentIpIds: parents,
            licenseTermsIds: termsIds,
            licenseTemplate: 0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316, // PIL
            royaltyContext: "",
            maxMintingFee: 0,
            maxRts: 0,
            maxRevenueShare: 0
        }),
        WorkflowStructs.IPMetadata({
            ipMetadataURI: "ipfs://...",
            ipMetadataHash: bytes32(0),
            nftMetadataURI: "ipfs://...",
            nftMetadataHash: bytes32(0)
        }),
        recipient,
        true
    );
    return (childIpId, tokenId);
}
```

## LicenseAttachmentWorkflows

**Address:** `0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8`
**Import:** `@story-protocol/periphery/workflows/LicenseAttachmentWorkflows.sol`

### Functions

```solidity
/// @notice Mints NFT + registers IP + attaches PIL license terms.
/// @param spgNftContract The SPGNFT collection to mint from.
/// @param recipient Address to receive the minted NFT.
/// @param ipMetadata IP and NFT metadata.
/// @param terms Array of PIL terms to attach.
/// @param allowDuplicates If false, reverts on duplicate.
/// @return ipId The IP Account address.
/// @return tokenId The minted NFT token ID.
/// @return licenseTermsIds Array of registered license terms IDs.
function mintAndRegisterIpAndAttachPILTerms(
    address spgNftContract,
    address recipient,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    PILTerms[] calldata terms,
    bool allowDuplicates
) external returns (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds);

/// @notice Registers existing NFT + attaches PIL terms (requires signatures).
function registerIpAndAttachPILTerms(
    address nftContract,
    uint256 tokenId,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    PILTerms[] calldata terms,
    WorkflowStructs.SignatureData calldata sigMetadata,
    WorkflowStructs.SignatureData calldata sigRegister,
    WorkflowStructs.SignatureData calldata sigAttach
) external returns (address ipId, uint256[] memory licenseTermsIds);

/// @notice Built-in multicall.
function multicall(bytes[] calldata data) external returns (bytes[] memory results);
```

### Usage: Register with License Terms

```solidity
import { LicenseAttachmentWorkflows } from "@story-protocol/periphery/workflows/LicenseAttachmentWorkflows.sol";
import { PILTerms } from "@story-protocol/core/modules/licensing/PILicenseTemplate.sol";

LicenseAttachmentWorkflows public constant LICENSE_ATTACH =
    LicenseAttachmentWorkflows(0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8);

function registerWithLicense(address spgNft, address recipient) external {
    PILTerms[] memory terms = new PILTerms[](1);
    terms[0] = PILTerms({
        transferable: true,
        royaltyPolicy: 0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E, // LAP
        defaultMintingFee: 0,
        expiration: 0,
        commercialUse: true,
        commercialAttribution: true,
        commercialRevShare: 500, // 5%
        commercialRevCeiling: 0,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: 0,
        currency: 0x1514000000000000000000000000000000000000, // WIP
        uri: ""
    });

    (address ipId, uint256 tokenId, uint256[] memory termsIds) =
        LICENSE_ATTACH.mintAndRegisterIpAndAttachPILTerms(
            spgNft,
            recipient,
            WorkflowStructs.IPMetadata({
                ipMetadataURI: "ipfs://...",
                ipMetadataHash: bytes32(0),
                nftMetadataURI: "ipfs://...",
                nftMetadataHash: bytes32(0)
            }),
            terms,
            true
        );
}
```

## GroupingWorkflows

**Address:** `0xD7c0beb3aa4DCD4723465f1ecAd045676c24CDCd`
**Import:** `@story-protocol/periphery/workflows/GroupingWorkflows.sol`

### Functions

```solidity
/// @notice Mints NFT + registers IP + attaches license + adds to group.
function mintAndRegisterIpAndAttachLicenseAndAddToGroup(
    address spgNftContract,
    address groupId,
    address recipient,
    address licenseTemplate,
    uint256 licenseTermsId,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    WorkflowStructs.SignatureData calldata sigAddToGroup,
    bool allowDuplicates
) external returns (address ipId, uint256 tokenId);

/// @notice Registers existing NFT + attaches license + adds to group.
function registerIpAndAttachLicenseAndAddToGroup(
    address nftContract,
    uint256 tokenId,
    address groupId,
    address licenseTemplate,
    uint256 licenseTermsId,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    WorkflowStructs.SignatureData calldata sigMetadataAndAttachAndConfig,
    WorkflowStructs.SignatureData calldata sigAddToGroup
) external returns (address ipId);

/// @notice Creates a group + attaches license + adds multiple IPs.
function registerGroupAndAttachLicenseAndAddIps(
    address groupPool,
    address[] calldata ipIds,
    address licenseTemplate,
    uint256 licenseTermsId
) external returns (address groupId);

/// @notice Built-in multicall.
function multicall(bytes[] calldata data) external returns (bytes[] memory results);
```

## RoyaltyWorkflows

**Address:** `0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890`
**Import:** `@story-protocol/periphery/workflows/RoyaltyWorkflows.sol`

### Functions

```solidity
/// @notice Claims all accumulated revenue for an IP across specified tokens.
/// @param ancestorIpId The IP to claim revenue for.
/// @param claimer Address to receive the claimed tokens.
/// @param currencyTokens Array of ERC-20 token addresses to claim.
/// @return amountsClaimed Array of amounts claimed per token.
function claimAllRevenue(
    address ancestorIpId,
    address claimer,
    address[] calldata currencyTokens
) external returns (uint256[] memory amountsClaimed);

/// @notice Claims revenue that flowed from child IPs to an ancestor IP.
function claimAllRevenueForAncestorIp(
    address ancestorIpId,
    address claimer,
    address[] calldata childIpIds,
    address[] calldata royaltyPolicies,
    address[] calldata currencyTokens
) external returns (uint256[] memory amountsClaimed);

/// @notice Built-in multicall.
function multicall(bytes[] calldata data) external returns (bytes[] memory results);
```

## RoyaltyTokenDistributionWorkflows

**Address:** `0xa38f42B8d33809917f23997B8423054aAB97322C`
**Import:** `@story-protocol/periphery/workflows/RoyaltyTokenDistributionWorkflows.sol`

### Functions

```solidity
/// @notice Mints NFT + registers IP + attaches PIL terms + distributes royalty vault tokens.
function mintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokens(
    address spgNftContract,
    address recipient,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    PILTerms[] calldata terms,
    WorkflowStructs.RoyaltyShare[] calldata royaltyShares,
    bool allowDuplicates
) external returns (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds);

/// @notice Mints NFT + registers IP + makes derivative + distributes royalty vault tokens.
function mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens(
    address spgNftContract,
    WorkflowStructs.MakeDerivative calldata derivData,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    WorkflowStructs.RoyaltyShare[] calldata royaltyShares,
    address recipient,
    bool allowDuplicates
) external returns (address ipId, uint256 tokenId);

/// @notice Built-in multicall.
function multicall(bytes[] calldata data) external returns (bytes[] memory results);
```

## Built-in Multicall Pattern

All SPG workflow contracts inherit OpenZeppelin's `Multicall`. Use this to batch operations in a single transaction.

### Encoding and Executing

```solidity
import { RegistrationWorkflows } from "@story-protocol/periphery/workflows/RegistrationWorkflows.sol";
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";

RegistrationWorkflows public constant REG =
    RegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424);

function batchMintAndRegister(
    address spgNft,
    address recipient,
    WorkflowStructs.IPMetadata[] calldata metadatas
) external returns (address[] memory ipIds) {
    bytes[] memory calls = new bytes[](metadatas.length);

    for (uint256 i = 0; i < metadatas.length; i++) {
        calls[i] = abi.encodeCall(
            REG.mintAndRegisterIp,
            (spgNft, recipient, metadatas[i], true)
        );
    }

    bytes[] memory results = REG.multicall(calls);

    ipIds = new address[](results.length);
    for (uint256 i = 0; i < results.length; i++) {
        (ipIds[i], ) = abi.decode(results[i], (address, uint256));
    }
}
```

### Why Multicall3 Does NOT Work With SPGNFT

The standard Multicall3 at `0xcA11bde05977b3631167028862bE2a173976CA11` breaks SPGNFT minting for the following reason:

```text
User EOA
  └── calls Multicall3.aggregate3()
        └── delegatecall RegistrationWorkflows.mintAndRegisterIp()
              └── msg.sender = Multicall3 address (NOT the user!)
                    └── SPGNFT checks msg.sender for minting rights
                          └── REVERTS: Multicall3 has no minting rights
```

**Root cause:** Multicall3 uses `delegatecall`, which changes `msg.sender` to the Multicall3 contract address. SPGNFT minting functions verify that `msg.sender` has minting rights on the collection.

**Solution:** Use the SPG contract's built-in `multicall()` function. It executes calls within the SPG contract's own context, preserving the correct caller.

```solidity
// WRONG: Using Multicall3
IMulticall3(0xcA11bde05977b3631167028862bE2a173976CA11).aggregate3(calls);

// CORRECT: Using SPG's built-in multicall
RegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424).multicall(calls);
```

**When Multicall3 IS safe:** Multicall3 can be used for read-only calls (view functions) or calls that do not involve SPGNFT minting. For example, querying `IPAssetRegistry.isRegistered()` for multiple IPs is fine via Multicall3.

## Gas Optimization Tips

1. **Batch with multicall:** Use SPG's built-in `multicall()` to batch multiple registrations or license attachments in one transaction, saving base gas costs per call.

2. **Use SPG workflows over raw core calls:** A single `mintAndRegisterIpAndAttachPILTerms()` is cheaper than separate `mint()` + `register()` + `attachLicenseTerms()` calls.

3. **Set allowDuplicates to true:** Checking for duplicates adds storage reads. If you know the NFT is not registered, set `allowDuplicates: true`.

4. **Use bytes32(0) for empty hashes:** When metadata hashes are not needed, pass `bytes32(0)` instead of computing a hash.

5. **Reuse existing license terms:** Call `PILicenseTemplate.getLicenseTermsId()` to check if terms already exist before registering new ones. Registering duplicate terms wastes gas.

6. **Fork testing gas caveat:** Gas costs on Aeneid fork tests may differ from mainnet due to state differences. Always test on the target network for accurate gas estimates.
