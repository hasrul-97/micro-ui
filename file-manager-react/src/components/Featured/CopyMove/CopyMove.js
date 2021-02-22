import { faChevronRight, faFile, faFileExcel, faFilePdf, faFileWord, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DataGrid } from '@material-ui/data-grid';
import React, { useEffect, useState } from 'react';
import './CopyMove.css';

export function CopyMove(props) {
    const [data, setData] = useState([]);
    const [breadCrumb, setBreadCrumb] = useState([]);
    let tenant = "c57abc28-4aad-11eb-b378-0242ac130002";
    let parent = "";

    const CACHE = props.folder;

    const columns = [
        {
            field: 'name', headerName: 'Name', width: 600,
            cellClassName: 'cursor',
            renderCell: (params) => {
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
    ];


    useEffect(() => {
        fetchRootData();
    }, [])

    function getIcon(type) {
        switch (type) {
            case 'doc': return faFileWord;
            case 'pdf': return faFilePdf;
            case 'xls': return faFileExcel;
            case 'Folder': return faFolderOpen;
            default: return faFile;
        }
    }

    function cell(data) {
        parent = data.row.id;
        if (breadCrumb.findIndex(_ => _.id === parent) === -1) {
            breadCrumb.push({ name: data.row.name, id: parent })
            setBreadCrumb(breadCrumb);
        }
        console.log(breadCrumb)
        props.update(data.row);
        fetchData()
    }

    function fetchRootData() {
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
                    breadCrumb.push({ name: "Root Folder", id: parent })
                    props.update({ id: parent });
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
        if (CACHE[parent] !== undefined) {
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

    function navigate(folderId) {
        parent = folderId;
        const index = breadCrumb.findIndex(_ => _.id === parent);
        if (index > -1) {
            breadCrumb.splice(index + 1, breadCrumb.length - (index + 1));
        }
        props.update(data.find(_ => _.folderId === folderId));
        fetchData();
    }

    return (<div>
        <div className="row folder">
            <div className="mr-auto">
                <ol className="breadcrumb">
                    {console.log(breadCrumb)}
                    {breadCrumb.map((folder, index) => (
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
            </div>
        </div>
        <div className="col-sm-12 col-md-12 col-lg-12 mt-2" style={{ height: '50vh', width: '100%' }}>
            <DataGrid rows={data} columns={columns} pageSize={10} autoHeight="true" hideFooterSelectedRowCount="true" onCellClick={cell} />
        </div>
    </div>)
}