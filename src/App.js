import { useRef, useEffect, useState } from "react";
import io from 'socket.io-client';
import { ChakraProvider, Box, Button, VStack, Text } from "@chakra-ui/react";
import { PhoneIcon } from "@chakra-ui/icons";

const socket = io(
  '/webRTCPeers',
  {
    path: '/webrtc'
  }
);

function App() {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(new RTCPeerConnection(null));
  const [callStatus, setCallStatus] = useState('Make a call now');

  useEffect(() => {
    const pc = peerConnection.current;

    socket.on('connection-success', success => {
      console.log(success);
    });
    socket.on('callEnded', () => {
      // Update the status to indicate that the call has ended
      setCallStatus('Call ended');
      const remoteStream = remoteVideoRef.current.srcObject;
      remoteStream.getTracks().forEach(track => track.stop());
    });
    socket.on('sdp', async data => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        setCallStatus(data.sdp.type === 'offer' ? 'Incoming call...' : 'Call established...');
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    socket.on('candidate', async candidate => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ice candidate:', error);
      }
    });

    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      })
      .catch(error => {
        console.log('getUserMedia Error:', error);
      });

    pc.onicecandidate = async e => {
      if (e.candidate) {
        console.log(JSON.stringify(e.candidate));
        sendToPeer('candidate', e.candidate);
      }
    };

    pc.oniceconnectionstatechange = e => {
      console.log(e);
    };

    pc.ontrack = e => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    return () => {
      socket.off('connection-success');
      socket.off('sdp');
      socket.off('candidate');
    };
  }, []);

  const sendToPeer = (eventType, payload) => {
    socket.emit(eventType, payload);
  };

  const createOffer = async () => {
    try {
      const offer = await peerConnection.current.createOffer({ offerToReceiveAudio: 1, offerToReceiveVideo: 1 });
      await peerConnection.current.setLocalDescription(offer);
      sendToPeer('sdp', { sdp: offer });
      setCallStatus('Calling...');
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const createAnswer = async () => {
    try {
      const answer = await peerConnection.current.createAnswer({ offerToReceiveAudio: 1, offerToReceiveVideo: 1 });
      await peerConnection.current.setLocalDescription(answer);
      sendToPeer('sdp', { sdp: answer });
      setCallStatus('Call established..');
    } catch (error) {
      console.error('Error creating answer:', error);
    }
  };

  const endCall = () => {
    peerConnection.current.close();
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      const remoteStream = remoteVideoRef.current.srcObject;
      remoteStream.getTracks().forEach(track => track.stop());
    }
    setCallStatus('Call ended');
    sendToPeer('callEnded', {});
  };

  return (
    <ChakraProvider>
      <Box
        display="flex"
        flexDirection="column"
        position="relative"
        padding="20px"
        justifyContent="start"
        alignItems="center"
        backgroundColor="#186994"
        color="whitesmoke"
        height="100vh"
      >
        <Text fontSize="24px" color="#29b2fb" textAlign="center" marginBottom="20px">
          P2P Connect
        </Text>
        <Box
          display="flex"
          maxHeight="60vh"
          gap="3"
          width="100%"
          justifyContent="center"
        >
          <Box
            as="video"
            ref={localVideoRef}
            autoPlay
            width="50%"
            border="solid 1px #29b2fb"
            borderRadius="10px"
            backgroundColor="black"
          />
          <Box
            as="video"
            ref={remoteVideoRef}
            autoPlay
            width="50%"
            border="solid 1px #29b2fb"
            borderRadius="10px"
          />
        </Box>
        <VStack
          position="absolute"
          bottom="0"
          left="50%"
          transform="translateX(-50%)"
          margin="auto"
          spacing={4}
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          marginBottom={4}
        >
          <Text>{callStatus}</Text>
          {callStatus === 'Make a call now' && (
            <Button
              backgroundColor="green.500"
              color="white"
              onClick={createOffer}
              leftIcon={<PhoneIcon />}
            >
              Call
            </Button>
          )}
          {callStatus === 'Incoming call...' && (
            <Button
              backgroundColor="green.500"
              color="white"
              onClick={createAnswer}
              leftIcon={<PhoneIcon />}
            >
              Answer
            </Button>
          )}
          {callStatus !== 'Make a call now' && (
            <Button
              backgroundColor="red.500"
              color="white"
              onClick={endCall}
              leftIcon={<PhoneIcon />}
            >
              End Call
            </Button>
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;
