import { HubConnectionBuilder } from '@microsoft/signalr';
import React, { useEffect, useState } from 'react';
import './Notification.css';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Box, Typography } from '@material-ui/core';

export function Notification(props) {

    // React.useEffect(() => {
    //     const timer = setInterval(() => {
    //         setProgress((prevProgress) => (prevProgress >= 100 ? 10 : prevProgress + 10));
    //     }, 800);
    //     return () => {
    //         clearInterval(timer);
    //     };
    // }, []);

    const [progress, setProgress] = useState(0);
    const [connection, setConnection] = useState(null);
    const [chat, setChat] = useState([]);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:44326/DMS/')
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        setProgress(props.progress);
    }, [props.progress])

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(result => {
                    console.log('Connected!');

                    connection.on('ReceiveMessage', message => {

                        setChat("Me");
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection]);

    function getConnectionId() {
        return connection.connectionId;
    }

    return (<div className="card main">
        <div className="card-body">
            <div className="row progress-header text-muted">
                {props.title}
            </div>
            <div className="row body-content" style={{ width: '100%' }}>
                <LinearProgressWithLabel value={progress} />
            </div>
            <div className="row body-content" style={{ width: '100%',height:'20px' }}>
                <button className="btn btn-danger mt-2 mr-auto ml-auto" onClick={props.cancelOperation}>Cancel</button>
            </div>
        </div>
    </div>)
}

function LinearProgressWithLabel(props) {
    return (
        <Box display="flex" alignItems="center">
            <Box width="200px" mr={1}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box minWidth={35}>
                <Typography variant="body2" color="textSecondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}