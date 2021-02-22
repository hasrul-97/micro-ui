import React, { useEffect, useState } from 'react';
import "./Home.css";
import { DataGrid } from '@material-ui/data-grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faCopy, faCut, faDownload, faFile, faFileExcel, faFilePdf, faFileWord, faFolderOpen, faPencilAlt, faPlus, faSearch, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons'
import ContentEditable from 'react-contenteditable';
import { Modal, Button } from 'react-bootstrap';
import { CopyMove } from '../CopyMove/CopyMove';
import { Notification } from '../Notification/Notification';
import { BlobServiceClient, AnonymousCredential, BlockBlobClient } from "@azure/storage-blob";
import { AbortController } from "@azure/abort-controller";
import { decode as base64_decode, encode as base64_encode } from 'base-64';
import S3 from 'react-aws-s3';


function getIcon(type) {
    switch (type) {
        case 'doc': return faFileWord;
        case 'pdf': return faFilePdf;
        case 'xls': return faFileExcel;
        case 'Folder': return faFolderOpen
        default: return faFile
    }
}

var folder = []
const CACHE = {}
const NEW_FOLDER = [];
const EDIT_FOLDER = [];
let folderError = "";
let folderName = "New Folder";
var regex = new RegExp("^[a-zA-Z0-9 ._-]+$");

let userID = "M1056247";
let tenant = "c57abc28-4aad-11eb-b378-0242ac130002";
let parent = "";
let newFolderAdded = false;
let selectedFolder = {};
let folderToDelete = {};
let folderToCopy = {};
let destinationFolder = {};
let operation = "";
let sasToken = '';
const controller = new AbortController();
let notificationTitle = "";
let uploadedFileSize = 0;
let blobURL = "";
let IsUploadOngoing = false;
let tokenTimerSeconds = 0;
let timer;
let uploadedFile = {};

export function Home() {

    const [show, setShow] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showAlreadyExistModel, setAlreadyExistModel] = useState(false);

    const [showNotification, setShowNotification] = useState(false);
    const [notificationProgress, setNotificationProgress] = useState(0);


    const [data, setData] = useState([]);
    const [error, setError] = useState("");

    // const [isUploadOngoing, setUpload] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleAlreadyExistModelClose = () => setAlreadyExistModel(false);
    const handleAlreadyExistModelShow = () => setAlreadyExistModel(true);

    const handleCopyClose = () => setShowModal(false);
    const handleCopyShow = () => setShowModal(true);

    const columns = [
        {
            field: 'name', headerName: 'Name', width: 900,
            cellClassName: 'cursor',
            renderCell: (params) => {
                if (NEW_FOLDER.findIndex(_ => (_.id === params.row.id)) > -1) {
                    return <span>
                        <FontAwesomeIcon icon={getIcon(params.row.fileType !== null ? params.row.fileType : params.row.type)} className={(params.row.fileType !== null ? params.row.fileType : params.row.type) + " mr-3"}></FontAwesomeIcon>
                        <ContentEditable html={folderName} id={params.row.id} onChange={handleChange} onClick={(e) => { e.stopPropagation(); e.preventDefault() }} onBlur={() => { SaveFolder(params.row.id) }} style={{ display: "inline", padding: "5px" }}></ContentEditable>
                    </span>
                }
                else
                    return <span id={params.row.id + "-parent"}><FontAwesomeIcon icon={getIcon(params.row.fileType !== null ? params.row.fileType : params.row.type)} className={(params.row.fileType !== null ? params.row.fileType : params.row.type) + " mr-3"}></FontAwesomeIcon>
                        <span id={params.row.id} className="padding">{params.value}</span></span>
            },
        },
        {
            field: 'lastModifiedOn', headerName: 'Modified', width: 200,
            renderCell: (params) => {
                let date = null
                if (params.value.indexOf("GMT") === -1) {
                    date = new Date(Date.parse(params.value + "z"))
                } else {
                    date = new Date(Date.parse(params.value))
                }
                return <span>{date.toLocaleString()}</span>
            },
        },
        { field: 'lastModifiedBy', headerName: 'Modified By', type: 'date', width: 200 },
        {
            field: 'button',
            headerName: 'Action',
            width: 200,
            renderCell: (params) => (
                <strong style={{ marginRight: "auto", marginLeft: "auto", cursor: 'pointer' }}>
                    <FontAwesomeIcon className="mr-3 icon edit" onClick={() => { Edit(params.row.id) }} icon={faPencilAlt} ></FontAwesomeIcon>
                    <FontAwesomeIcon className="mr-3 icon delete" onClick={() => { Delete(params.row.id) }} icon={faTrash}></FontAwesomeIcon>
                    <FontAwesomeIcon className="mr-3 icon copy" onClick={() => { Copy(params.row.id) }} icon={faCopy}></FontAwesomeIcon>
                    <FontAwesomeIcon className="mr-3 icon move" onClick={() => { Move(params.row.id) }} icon={faCut}></FontAwesomeIcon>
                </strong>
            ),
        }, {
            field: 'size', headerName: 'Size', width: 200,
            renderCell: (params) => {
                return <span>{formatBytes(params.value)}</span>
            },
        }
    ];

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function handleChange($event) {
        folderName = $event.target.value;
    }

    var SaveFolder = (id) => {
        let ele = document.getElementById(id)
        //  TO CHECK IF THE TYPED NAME IS ALREADY PRESENT IN THE FOLDER
        if (ValidationCheck(folderName)) {
            if (ele.classList.contains('error')) {
                ele.classList.remove('error');
            }
            PostFolder();
        } else {
            ele.classList.add('error')
        }

    }

    var RenameFolder = (id) => {
        let ele = document.getElementById(id)
        //  TO CHECK IF THE TYPED NAME IS ALREADY PRESENT IN THE FOLDER
        if (ValidationCheck(ele.innerHTML)) {
            if (ele.classList.contains('error')) {
                ele.classList.remove('error');
            }
            PutFolder(ele.innerHTML);
        } else {
            ele.classList.add('error')
        }

    }

    function PostFolder() {
        fetch("https://localhost:44326/" + tenant + "/CreateFolder", {

            // Adding method type 
            method: "POST",

            // Adding body or contents to send 
            body: JSON.stringify({
                Name: folderName.replace(/\s+/g, ' ').trim(),
                Parent: parent,
                TenantID: tenant,
                UserID: userID
            }),

            // Adding headers to the request 
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).catch(err => console.log(err)).then(res => {
            NEW_FOLDER.pop();
            folderName = "New Folder";
            newFolderAdded = true;
            fetchData();
        })
    }

    function PutFolder(newName) {
        fetch("https://localhost:44326/" + tenant + "/RenameFolder", {

            // Adding method type 
            method: "PUT",

            // Adding body or contents to send 
            body: JSON.stringify({
                PreviousName: selectedFolder.name.replace(/\s+/g, ' ').trim(),
                NewName: newName.replace(/\s+/g, ' ').trim(),
                FolderID: selectedFolder.id,
                TenantID: tenant,
                UserID: userID
            }),

            // Adding headers to the request 
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).catch(err => console.log(err)).then(res => {
            newFolderAdded = true;
            EDIT_FOLDER.pop();
            selectedFolder = {}
            fetchData();
        })
    }

    function DeleteFolder() {
        fetch("https://localhost:44326/" + tenant + "/DeleteFolder", {

            // Adding method type 
            method: "DELETE",

            // Adding body or contents to send 
            body: JSON.stringify({
                Name: folderToDelete.name.replace(/\s+/g, ' ').trim(),
                Parent: folderToDelete.parent,
                FolderID: folderToDelete.id,
                TenantID: tenant,
                UserID: userID
            }),

            // Adding headers to the request 
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).catch(err => console.log(err)).then(res => {
            folderToDelete = {}
            newFolderAdded = true;
            fetchData();
        })
    }

    function ValidationCheck(name) {
        if (name === "" || name === null) {
            folderError = "Please type in the folder name";
            setError(folderError)
            return false;
        }
        if (data.findIndex(_ => _.name === name) > -1) {
            folderError = "Folder name should be unique";
            setError(folderError)
            return false;
        }
        if (name.length > 20) {
            folderError = "Folder name cannot be more than 20 characters";
            setError(folderError)
            return false;
        }
        if (!regex.test(name)) {
            folderError = "Folder name cannot contain special characters";
            setError(folderError)
            return false;
        }
        folderError = "";
        setError(folderError)
        return true;
    }

    function CopyFolder() {

        fetch("https://localhost:44326/" + tenant + "/Folder/Copy", {

            // Adding method type 
            method: "POST",

            // Adding body or contents to send 
            body: JSON.stringify({
                SourceFolders: folderToCopy,
                Target: destinationFolder,
                UserID: userID,
                ConnectionID: "",
                CanMerge: true
            }),

            // Adding headers to the request 
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).catch(err => console.log(err)).then(res => {
            NEW_FOLDER.pop();
            folderToCopy = {};
            newFolderAdded = true;
            fetchData();
        })
    }

    function MoveFolder() {

        fetch("https://localhost:44326/" + tenant + "/Folder/Move", {

            // Adding method type 
            method: "POST",

            // Adding body or contents to send 
            body: JSON.stringify({
                SourceFolders: folderToCopy,
                Target: destinationFolder,
                UserID: userID,
                ConnectionID: "",
                CanMerge: true
            }),

            // Adding headers to the request 
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).catch(err => console.log(err)).then(res => {
            NEW_FOLDER.pop();
            folderToCopy = {};
            newFolderAdded = true;
            fetchData();
        })
    }


    useEffect(() => {
        fetchRootData();
    }, [])


    function fetchRootData() {
        if (CACHE[parent] !== undefined) {
            setData(CACHE[parent])
        }
        fetch('https://localhost:44326/' + tenant)
            .then(res => res.json())
            .then(
                (result) => {
                    parent = result.parent;
                    let folders = result.items;
                    folders.sort((a, b) => {
                        if (a.type === b.type) {
                            if (a.name > b.name) {
                                return 1
                            } else {
                                return -1;
                            }
                        } else if (a.type === "Folder") {
                            return -1;
                        }
                        else {
                            return 1;
                        }
                    })
                    CACHE[parent] = folders
                    folder = [];
                    folder.push({ name: "Root Folder", id: parent })
                    setData(folders);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log(error);
                });
    }

    function fetchData() {
        if (CACHE[parent] !== undefined && !newFolderAdded) {
            setData(CACHE[parent])
        } else {
            fetch('https://localhost:44326/' + tenant + "/" + parent)
                .then(res => res.json())
                .then(
                    (result) => {
                        parent = result.parent;
                        let folders = result.items;
                        folders.sort((a, b) => {
                            if (a.type === b.type) {
                                if (a.name > b.name) {
                                    return 1
                                } else {
                                    return -1;
                                }
                            } else if (a.type === "Folder") {
                                return -1;
                            }
                            else {
                                return 1;
                            }
                        })
                        CACHE[parent] = folders
                        setData(folders);
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        console.log(error);
                    });
        }
    }

    function AddNewFolder() {
        if (NEW_FOLDER.length === 0) {
            NEW_FOLDER.push({
                id: (data.length + 1),
                createdOn: new Date(),
                name: "New Folder",
                fileType: null,
                type: "Folder"
            });
            data.push({
                id: (data.length + 1),
                createdOn: new Date(),
                lastModifiedOn: GenerateDate(),
                lastModifiedBy: "M105624",
                name: "New Folder",
                fileType: null,
                type: "Folder"
            })
            setData([...data]);
            setTimeout(() => {
                document.getElementById(Number(data.length)).focus()
            }, 500);
        } else {
            alert("A created new folder has not been saved yet")
        }
    }

    function GenerateDate() {
        return new Date().toUTCString();
    }

    function progress(progress) {
        setNotificationProgress((progress.loadedBytes / uploadedFileSize) * 100);
    }

    function fetchToken() {
        return fetch('https://localhost:44326/' + tenant + "/token")
            .then(res => res.text())
            .then((data) => {
                sasToken = data;
                let seconds = 0;
                if (timer !== undefined) {
                    clearInterval(timer);
                }
                timer = setInterval(() => {
                    if (IsUploadOngoing === true && seconds <= 40) {
                        seconds += 1;
                        console.log(seconds)
                    } else {
                        sasToken = null;
                        seconds = 0;
                    }
                }, 1000)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async function GetAuthenticatedBlobClientForUpload(file) {
        await fetchToken();
        let client = await GetAzureClient('filemanagementapp', sasToken);
        const containerClient = await client.getContainerClient("file-container");
        await containerClient.createIfNotExists();
        let blobClient = await containerClient.getBlockBlobClient(file.name);
        return blobClient;
    }


    async function OnUpload(e) {
        uploadedFileSize = e.target.files[0].size;
        IsUploadOngoing = true;
        let file = e.target.files[0];
        document.getElementById('file').value = "";
        file.version = 1;
        uploadedFile = file;
        if (data.findIndex(_ => _.type === "File" && _.name === file.name) > -1) {
            handleAlreadyExistModelShow(true);
        } else {
            VerifySizeAndUpload(await GetAuthenticatedBlobClientForUpload(file), file);
        }
    }


    async function VerifySizeAndUpload(blobClient, file) {
        notificationTitle = `Uploading ${file.name}`;
        setNotificationProgress(0)
        setShowNotification(true);
        blobURL = `https://${blobClient.accountName}.blob.core.windows.net/${blobClient._containerName}/${file.name}`
        let chunkSize = 524288;
        try {
            if (file.size <= chunkSize) {
                const options = { blobHTTPHeaders: { blobContentType: file.type }, onProgress: progress, abortSignal: controller.signal, maxSingleShotSize: 100 };
                blobClient.uploadData(file, options).then((x) => {
                    ConstructAndSaveFile(file);
                }).catch(() => { setShowNotification(false) });
            } else {
                let startPointer = 0;
                let endPointer = chunkSize;
                let blockIds = [];
                let unCommitedBlockList = []
                let chunksCount = file.size % chunkSize === 0 ? file.size / chunkSize : Math.ceil(file.size / chunkSize);
                let client = await GetBlockBlobClient('filemanagementapp', sasToken, "try", file.name);
                if (await client.exists()) {
                    let blockList = await client.getBlockList("all");
                    unCommitedBlockList = blockList.uncommittedBlocks;
                }
                let chunkUploadedSuccessfullyCount = 0;
                const options = { blobHTTPHeaders: { blobContentType: file.type }, abortSignal: controller.signal };
                ChunkFileAndUploadAsync(startPointer, endPointer, chunkSize, chunksCount, chunkUploadedSuccessfullyCount, blockIds, blobClient, file, unCommitedBlockList, options)
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    function fill(number, length) {
        let str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }

    async function ChunkFileAndUploadAsync(startPointer, endPointer, chunkSize, chunksCount, chunkUploadedSuccessfullyCount, blockIds, blobClient, file, uncommitedBlock, options) {
        if (endPointer <= file.size && ((file.size - startPointer) !== 0)) {
            let reader = new FileReader();
            let chunk = file.slice(startPointer, endPointer);
            reader.readAsArrayBuffer(chunk);
            startPointer = endPointer;
            (file.size - startPointer) >= chunkSize ? endPointer += chunkSize : endPointer = file.size;
            reader.onload = async (e) => {
                let blockId = base64_encode("BlockID:" + fill(blockIds.length, 10));
                blockIds.push(blockId);
                if (sasToken === null) {
                    console.log("Getting new token")
                    blobClient = await GetAuthenticatedBlobClientForUpload(file);
                }
                if (uncommitedBlock.indexOf(_ => _.name === blockId) === -1) {
                    blobClient.stageBlock(blockId, e.target.result, chunkSize, options).then(async (e) => {
                        chunkUploadedSuccessfullyCount++;
                        setNotificationProgress((chunkUploadedSuccessfullyCount / chunksCount) * 100)
                        if (chunksCount === chunkUploadedSuccessfullyCount) {
                            blobClient.commitBlockList(blockIds);
                            ConstructAndSaveFile(file);
                        } else {
                            ChunkFileAndUploadAsync(startPointer, endPointer, chunkSize, chunksCount, chunkUploadedSuccessfullyCount, blockIds, blobClient, file, uncommitedBlock, options)
                        }
                    });
                } else {
                    chunkUploadedSuccessfullyCount++;
                    setNotificationProgress((chunkUploadedSuccessfullyCount / chunksCount) * 100)
                    if (chunksCount === chunkUploadedSuccessfullyCount) {
                        blobClient.commitBlockList(blockIds);
                        ConstructAndSaveFile(file);
                    }
                    ChunkFileAndUploadAsync(startPointer, endPointer, chunkSize, chunksCount, chunkUploadedSuccessfullyCount, blockIds, blobClient, file, uncommitedBlock, options)
                }
            }
        }
    }

    function ConstructAndSaveFile(file) {
        let fileToSend = {};
        fileToSend.physicalLocation = blobURL;
        fileToSend.name = file.name;
        fileToSend.parent = parent;
        fileToSend.userID = userID;
        fileToSend.fileType = file.type;
        fileToSend.type = "File";
        fileToSend.tenantID = tenant;
        fileToSend.size = file.size.toString();
        fileToSend.version = file.version;
        SaveFile(fileToSend);
    }

    function SaveFile(file) {
        fetch("https://localhost:44326/" + tenant + "/File/Save", {

            // Adding method type 
            method: "POST",

            // Adding body or contents to send 
            body: JSON.stringify(file),

            // Adding headers to the request 
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).catch(err => console.log(err)).then(res => {
            newFolderAdded = true;
            setTimeout(() => {
                setShowNotification(false);
                setNotificationProgress(0)
            }, 1000);
            IsUploadOngoing = false;
            clearInterval(timer)
            fetchData();
        })
    }

    function GetAzureClient(account, accountSas) {
        const anonymousCredential = new AnonymousCredential();
        const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net/${accountSas}`,
            anonymousCredential
        );
        return blobServiceClient;
    }

    function GetBlockBlobClient(account, accountSas, container, blob) {
        const anonymousCredential = new AnonymousCredential();
        const blockBlobClient = new BlockBlobClient(`https://${account}.blob.core.windows.net/${container}/${blob}?${accountSas}`,
            anonymousCredential
        );
        return blockBlobClient;
    }

    function cell(data) {
        if (NEW_FOLDER.findIndex(_ => (_.id === data.row.id)) === -1 && data.field === 'name' && (EDIT_FOLDER.indexOf(data.row.id) === -1)) {
            parent = data.row.id;
            if (folder.findIndex(_ => _.id === parent) === -1) {
                folder.push({ name: data.row.name, id: parent })
            }
            fetchData()
        }
    }

    function Edit(id) {
        if (EDIT_FOLDER.length === 0) {
            EDIT_FOLDER.push(id);
            let parent = document.getElementById(id + "-parent");
            let ele = document.getElementById(id);
            let contentEditable = document.createElement('div')
            contentEditable.id = id;
            contentEditable.setAttribute('ContentEditable', true)
            contentEditable.onclick = function (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            contentEditable.onblur = () => {
                RenameFolder(id);
            }
            contentEditable.style.display = "inline";
            contentEditable.classList.add("padding")
            selectedFolder.id = id;
            selectedFolder.name = ele.innerHTML;
            contentEditable.innerHTML = ele.innerHTML
            ele.insertAdjacentElement("beforebegin", contentEditable)
            parent.removeChild(ele);
            setTimeout(() => {
                document.getElementById(id).focus();
            }, 500);
        }
        else {
            alert("There is already a folder in editing")
        }
    }

    function Delete(id) {
        folderToDelete = data.find(obj => obj.id === id);
        handleShow();
    }

    function Copy(id) {
        folderToCopy = (data.find(obj => obj.id === id));
        operation = "Copy"
        handleCopyShow();
    }

    function Move(id) {
        folderToCopy = (data.find(obj => obj.id === id));
        operation = "Move"
        handleCopyShow();
    }

    function HandleButtonClick() {
        if (operation === "Copy") {
            CopyFolder()
        } else if (operation === "Move") {
            MoveFolder();
        }
    }

    function navigate(folderId) {
        parent = folderId;
        const index = folder.findIndex(_ => _.id === parent);
        if (index > -1) {
            folder.splice(index + 1, folder.length - (index + 1));
        }
        fetchData();
    }

    function selectedFolderFromChild(e) {
        destinationFolder = e
    }

    async function AddVersion() {
        uploadedFile.version = Number(data.find(_ => _.type === "File" && _.name === uploadedFile.name).version) + 1;
        VerifySizeAndUpload(await GetAuthenticatedBlobClientForUpload(uploadedFile), uploadedFile);
    }



    return (<div className="mt-4 ml-4 mr-4">
        {showNotification === true &&
            < Notification style={{ position: 'absolute' }} progress={notificationProgress} cancelOperation={() => { controller.abort() }} title={notificationTitle} />
        }
        <div className="row folder">
            <div className="mr-auto">
                <ol className="breadcrumb">
                    {folder.map((folder, index) => (
                        <li key={index} className="breadcrumb-item" >
                            <a className="black-text" onClick={() => navigate(folder.id)}>{folder.name}</a>
                            {index !== (folder.length - 1) ?
                                <FontAwesomeIcon
                                    icon={faChevronRight}
                                    className="arrow"
                                ></FontAwesomeIcon> : null
                            }
                        </li>
                    ))}
                </ol>
            </div><div className="search-box ml-auto">
                <input className="search-input" type="text" name="" placeholder="Search" />
                <a href="#" className="search-btn">
                    <FontAwesomeIcon icon={faSearch} style={{ color: "black" }}></FontAwesomeIcon>
                </a>
            </div>
        </div>
        <div className="row item-row">
            <div className="ml-4 mr-4">
                <a className="button" onClick={() => { AddNewFolder() }}><span className="mr-2"><FontAwesomeIcon icon={faPlus}></FontAwesomeIcon></span>New</a>
                <input type="file" id="file" onInput={(e) => OnUpload(e)} />
                <label htmlFor="file" ><FontAwesomeIcon icon={faUpload} className="mr-1"></FontAwesomeIcon>Upload</label>
                <a className="button"><span className="mr-2"><FontAwesomeIcon icon={faDownload}></FontAwesomeIcon></span>Download</a>
            </div>
        </div>

        <div className="col-sm-12 col-md-12 col-lg-12 mt-2" style={{ height: '53 vh', width: '100%' }}>
            <DataGrid rows={data} columns={columns} pageSize={10} autoHeight="true" hideFooterSelectedRowCount="true" onCellClick={cell} />
        </div>
        <div>
            <p className="text-danger">{error}</p>
        </div>
        <Modal show={showModal} onHide={handleCopyClose} dialogClassName="custom-modal" bsClass="my-modal">
            <Modal.Header closeButton>
                <Modal.Title>{operation} Folder</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CopyMove folder={CACHE} update={selectedFolderFromChild} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCopyClose}>
                    Close
          </Button>
                <Button variant="success" onClick={() => { HandleButtonClick(); handleCopyClose(); }}>
                    {operation} Here
          </Button>
            </Modal.Footer>
        </Modal>

        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Folder</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete '{folderToDelete.name}'' and all of its content?</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
          </Button>
                <Button variant="danger" onClick={() => { DeleteFolder(); handleClose() }}>
                    Delete
          </Button>
            </Modal.Footer>
        </Modal>

        <Modal show={showAlreadyExistModel} onHide={handleAlreadyExistModelClose}>
            <Modal.Header closeButton>
                <Modal.Title>File already exists!</Modal.Title>
            </Modal.Header>
            <Modal.Body>Do you want to update <strong>{uploadedFile.name}</strong> with your latest file?</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleAlreadyExistModelClose}>
                    No
          </Button>
                <Button variant="danger" onClick={() => { AddVersion(); handleAlreadyExistModelClose() }}>
                    Yes
          </Button>
            </Modal.Footer>
        </Modal>
    </div>)
}