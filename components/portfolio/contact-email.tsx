"use client"

import { useState } from "react"
import { Mail, Check, Copy } from "lucide-react"

export function ContactEmail() {
  const [copied, setCopied] = useState(false)
  const email = "ayan.aslam.cs@gmail.com"

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(email).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2200)
      })
    }
  }

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If on mobile (iOS / Android), let the native mailto: handler open the installed mail app (Gmail, Apple Mail)
    const isMobile =
      typeof navigator !== "undefined" &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (!isMobile) {
      // On desktop, open Gmail web composer in a new tab
      e.preventDefault()
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`,
        "_blank",
        "noopener,noreferrer"
      )
    }
  }

  return (
    <div className="contact-email-card">
      <a
        href={`mailto:${email}`}
        onClick={handleEmailClick}
        className="contact-email-link"
        aria-label={`Send email to ${email}`}
      >
        <Mail className="h-4 w-4 shrink-0" />
        <span className="contact-email-address font-mono">{email}</span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="contact-copy-btn font-mono"
        aria-label={copied ? "Email copied to clipboard" : "Copy email address to clipboard"}
        title="Copy email address"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  )
}
