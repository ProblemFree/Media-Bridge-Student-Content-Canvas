"use client"

import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client"
import IconButton from '@mui/material/IconButton';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export default function Modal({isVisible, setVisible, response, color}) {
    return (
        <div style={{position: "fixed", left:"calc(50% - 140px)", top: "90%"}}>
            <AnimatePresence initial={false}>
                {isVisible ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        style={{width: "280px", backgroundColor: color, display:"flex", alignItems: "center", padding: "10px", borderRadius: "4px",
                            boxShadow: "0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)"
                        }}
                        key="box"
                    >
                        <div style={{color: "white", maxWidth:"200px", wordWrap: "break-word"}}>{response}</div>
                        <IconButton aria-label="delete" size="large" color="white" onClick={setVisible}>
                            <HighlightOffIcon fontSize="large" sx={{color: "white"}}/>
                        </IconButton>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}