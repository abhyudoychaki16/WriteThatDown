import React, { useContext, useEffect, useState } from 'react'
import Login from '../components/Login';
import Signup from '../components/Signup';
import { Typography } from '@mui/material';
import { connectToSocket } from '../utils/api';
import { AppSocketContext } from '../utils/context';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
    const { setSocket } = useContext(AppSocketContext);
    const [login, setLogin] = useState<boolean>(true);
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token){
            const currentSocket = connectToSocket(token);
            currentSocket.then((socket) => {
                if(socket === null){
                    localStorage.removeItem('token');
                }
                else{
                    setSocket?.(socket);
                    navigate("/folders");
                }
                console.log(socket);
            })
        }
    }, [])
    return (
        <div 
            style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column', 
            }}
        >
            <h1>WriteThatDown</h1>
            <div style={{ border: '0.5px solid black', borderRadius:'6px', width: '40%', padding: '16px', textAlign: 'center' }}>
                {login ? <Login /> : <Signup />}
            </div>
            <Typography
                variant='caption'
                onClick={() => setLogin(!login)}
                style={{marginTop:'2%', cursor:'pointer'}}
            >
                {login ? 'First Time Here? Signup' : 'Already a member? Login'}
            </Typography>
        </div>
    )
}

export default AuthPage;