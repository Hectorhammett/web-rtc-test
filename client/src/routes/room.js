import React, { useRef, useEffect } from 'react';
import io from 'socket.io-client';

const Room = (props) => {
    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();
    const socketRef = useRef();
    const otherUser = useRef();
    const userStream = useRef();

    const handleNegotiationsNeededEvent = (userId) => {
        peerRef.current.createOffer()
            .then((offer) => {
                return peerRef.current.setLocalDescription(offer)
            })
            .then(() => {
                const payload = {
                    target: userId,
                    caller: socketRef.current.id,
                    sdp: peerRef.current.localDescription
                };

                socketRef.current.emit('offer', payload);
            })
            .catch((e) => {
                console.log(e);
            })
    };

    const createPeer = (userId) => {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                },
                {
                    urls: 'turn:numb.viagenia.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                }
            ]
        });

        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () => handleNegotiationsNeededEvent(userId);

        return peer;
    };

    const callUser = (userId) => {
        peerRef.current = createPeer(userId);
        userStream.current.getTracks().forEach((track) => peerRef.current.addTrack(track, userStream.current));
    }

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((stream) => {
                userVideo.current.srcObject = stream;
                userStream.current = stream;

                socketRef.current = io.connect('/');
                socketRef.current.emit('join room', props.match.params.roomId);

                socketRef.current.on('other user', (userId) => {
                    callUser(userId);
                    otherUser.current = userId;
                })

                socketRef.current.on('user joined', (userId) => {
                    otherUser.current = userId;
                });

                socketRef.current.on('offer', handeRecieveCall);
                socketRef.current.on('answe', handleAnswer);
                socketRef.current.on('ice-candidate', handleNewICECandidate);
            });
    }, []);

    return (
        <div>
            <video autoPlay ref={userVideo} />
            <video autoPlay ref={partnerVideo} />
        </div>
    )
};

export default Room;