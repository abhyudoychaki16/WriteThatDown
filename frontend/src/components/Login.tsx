import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import React, { useContext, useState } from "react";
import { validateEmail, validatePasswordLength } from "../utils/validations";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { sendLoginData } from "../utils/api";
import { AppSocketContext } from "../utils/context";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const { setSocket } = useContext(AppSocketContext);
    const [email, setEmail] = useState<string> ("");
    const [password, setPassword] = useState<string> ("");
    const [showPassword, setShowPassword] = useState<boolean> (false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        // send the data to the backend, and turn on the
        // listeners for getting the token back from the
        // backend
        const {type, token, socket} = await sendLoginData(email, password);
        if(type === "error"){
            console.log("Login failed");
            setSocket?.(null);
        }
        else {
            setSocket?.(socket !);
            localStorage.setItem("token", token !);
            navigate("/folders");
        }
    }

    return (
        <div>
            <Box
                component="form"
                sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
                autoComplete="off"
            >
                <TextField
                    required
                    error={!validateEmail(email)}
                    label="Email"
                    placeholder="johndoe@example.com"
                    value={email}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                    style={{ width: '100%', marginLeft: '0' }}
                />
                <FormControl variant="outlined" style={{ width: '100%', marginLeft: '0' }}>
                    <InputLabel>Password*</InputLabel>
                    <OutlinedInput
                        required
                        placeholder="johndoe123"
                        type={showPassword ? 'text' : 'password'}
                        error={!validatePasswordLength(password, 8)}
                        value={password}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={
                                        showPassword ? 'hide the password' : 'display the password'
                                    }
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                </FormControl>
                <Button variant="contained" style={{margin:'2%'}} onClick={handleLogin}>Log in</Button>
            </Box>
        </div>
    );
}

export default Login;