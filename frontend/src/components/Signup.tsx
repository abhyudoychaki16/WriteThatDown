import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import React, { useState } from "react";
import { validateEmail, validatePasswordLength } from "../utils/validations";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { sendSignupData } from "../utils/api";

const Signup: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [enterprise, setEnterprise] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleSubmit = async () => {
        const signupSuccess = await sendSignupData(name, email, enterprise, password);
        if(signupSuccess){
            window.location.reload();
        }
        else{
            console.log("Signup Unsuccessful, please try again!");
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
                    label="Name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
                    style={{ width: '100%', marginLeft: '0' }}
                    fullWidth
                />
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
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        error={!validatePasswordLength(password, 8)}
                        value={password}
                        placeholder="johndoe123"
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
                <TextField
                    required
                    label="Organization"
                    placeholder="ABC Enterprises"
                    value={enterprise}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEnterprise(event.target.value)}
                    style={{ width: '100%', marginLeft: '0' }}
                />
                <Button variant="contained" onClick={handleSubmit}>Sign Up</Button>
                {/* Change this later to automatically fetch the organization from the email. */}
            </Box>
        </div>
    )
}

export default Signup;