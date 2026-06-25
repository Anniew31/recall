import { useEffect, useState } from "react"

type ErrorProps = {
    message: string
    onClose: () => void
}

export default function Error({ message, onClose }: ErrorProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setTimeout(() => setVisible(true), 10)
        const timer = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 400)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
            <div className="flex items-center gap-3 bg-[#1e293b] border border-red-500/40 px-5 py-3.5 rounded-2xl shadow-xl">
                <p className="text-red-300 text-sm font-semibold whitespace-nowrap">{message}</p>
                <button
                    onClick={() => { setVisible(false); setTimeout(onClose, 400) }}
                    className="text-red-400 hover:text-red-200 transition-colors ml-1 text-base leading-none"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}