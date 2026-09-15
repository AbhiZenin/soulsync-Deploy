import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'SoulSync — Meaningful matches',description:'A modern matrimonial platform built for genuine, compatible relationships.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
