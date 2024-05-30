"use client";

import { SetStateAction, useEffect, useState } from "react";
import { socket } from "./socket";
import { Box, Button, Stack, TextField } from "@mui/material";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const [message, setMessage] = useState("");
  const [allmessages, setAllmessages] = useState(new Set([""]));

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("connected");
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport: { name: SetStateAction<string>; }) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      console.log("disconnected");
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);

    socket.on('message', (message) => {
      console.log('message: ', message);
      setAllmessages((prevMessages: any) => new Set([...prevMessages, message]));
    });

    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleSubmit = () => {
    socket.emit("message", message);
    setMessage("");
  }

  return (
    // <div>
    //   <p>Status: {isConnected ? "connected" : "disconnected"}</p>
    //   <p>Transport: {transport}</p>
    // </div>
    <Stack gap={2} m={2}>
      <Box sx={{ fontSize: '24px', fontWeight: 'bold' }}>This is socket tutorial</Box>
      <TextField value={message} onChange={(e) => setMessage(e.target.value)} ></TextField>
      <Button variant="contained" sx={{ width: '60px' }} onClick={handleSubmit}>Send</Button>
      <Stack>
        {Array.from(allmessages).map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </Stack>
    </Stack>
  );
}