import { FormValuesType } from '../components/ui//UploadForm/UploadForm';
import {
    buildNFTMetadata,
    getMetadataFromIPFS,
    getNftFromIPFS,
    NFTMetadata,
    uploadFileToIPFS
    } from './ipfs';
import { mintAndCreateMarketItem } from './marketplace_contract';
import { cidToTokenID, getNFTuri } from './nft_contract';

// NFT Form Test
const testNFTSubmission = async (
    file: File,
    formValues: FormValuesType,
    address: string,
    setUrl: (u: string | null) => void,
    setRetrievedNFT: (nft: string | null) => void
) => {
    // Uploads file to IPFS
    console.log("Uploading file to IPFS....");
    const fileCID = await uploadFileToIPFS(file);
    console.log("SUCCESS: File uploaded with CID ", fileCID.toString());

    // Creates NFT Metadata
    console.log("\nCreating NFT Metadata...");
    const nftMetadata = buildNFTMetadata({
        name: formValues.name, 
        description: formValues.description,
        image: fileCID.toString()
    });
    console.log("SUCCESS: NFT metadata created")
    console.log(nftMetadata)

    // Uploads Metadata to IPFS
    console.log("\nUploading Metadata to IPFS...");
    const metadataFile = new File([new Blob([nftMetadata], {type: 'application/json'})], 
        `${formValues.name.trim().split(' ').join('_')}_metadata.json`, {type: 'application/json'});
    const metadataCID = await uploadFileToIPFS(metadataFile);
    console.log("SUCCESS: Metadata uploaded with CID ", metadataCID.toString());
    
    // Creates TokenID
    console.log("\nCreating TokenID from CID...");
    const tokenID = cidToTokenID(metadataCID);
    console.log("SUCCESS: Created tokenID ", tokenID);

    // Mints
    console.log("\nMinting Token...")
    const mintResp = await mintAndCreateMarketItem(address, tokenID, address, 100, 0);

    if(mintResp.status === "Success") {
        console.log("SUCCESS: Successfully Minted Token")
    } else {
        console.log("Error Minting Token: ", mintResp.error)
        return;
    }

    // Retrieves Token from Contract
    console.log("\nRetrieving token from contract...");
    const tokenURIResp = await getNFTuri(tokenID);
    if(tokenURIResp.status === "Success") {
        console.log("SUCCESS: Token URI retrieved")
        console.log("URI: ", tokenURIResp.uri);
    } else {
        console.log("Error retrieving token URI: ", tokenURIResp.error);
        return;
    }

    // Retrieves Metadata from IPFS
    console.log("\nRetrieving Metadata from IPFS...");
    const ipfsMetadataResp = await getMetadataFromIPFS(tokenURIResp.uri);
    let ipfsMetadata: NFTMetadata;
    if(ipfsMetadataResp.status === "Success") {
        ipfsMetadata = ipfsMetadataResp.metadata;
        console.log("SUCCESS: Retrieved Metadata from IPFS")
        console.log(ipfsMetadata);
    } else {
        console.log("Error retrieving Metadata: ", ipfsMetadataResp.error);
        return;
    }
    
    // Retrieves NFT from IPFS
    console.log("\nRetrieving NFT from IPFS...");
    const ipfsNFTResp = await getNftFromIPFS(ipfsMetadata.image, ipfsMetadata.name.trim().split(' ').join('_'));
    if(ipfsNFTResp.status === "Success") {
        console.log("\nSUCCESS: NFT File Retrieved");
        const nftUrl = URL.createObjectURL(ipfsNFTResp.file);
        setUrl(nftUrl);
    } else {
        console.log("Error retrieving NFT: ", ipfsNFTResp.error);
        setUrl(null);
    }

    setRetrievedNFT(ipfsMetadata.name)
}

export default testNFTSubmission;