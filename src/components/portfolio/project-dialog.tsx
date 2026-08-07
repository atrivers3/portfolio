"use client"

import { ExternalLink } from "lucide-react"
import type { Project } from "@/lib/portfolio-data"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ProjectDialog({ project, open, onOpenChange }: { project: Project | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!project) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="architecture-dialog sm:max-w-3xl">
        <DialogHeader>
          <div className="dialog-kicker font-mono">ARCHITECTURE LOG / {project.id.toUpperCase()}</div>
          <DialogTitle className="dialog-title">{project.name}</DialogTitle>
          <DialogDescription>{project.summary}</DialogDescription>
        </DialogHeader>
        <div className="dialog-layout">
          <div className="dialog-topology" aria-label={`${project.name} topology diagram`}>
            {project.nodes.map((node, index) => <div key={node} className="dialog-node"><span className="font-mono">0{index + 1}</span>{node}</div>)}
            <svg viewBox="0 0 640 190" preserveAspectRatio="none" aria-hidden="true"><path d="M76 98 C150 22 212 166 288 94 S424 30 558 98" /></svg>
          </div>
          <div className="decision-grid">
            <div><span>Constraint</span><p>{project.problem}</p></div>
            <div><span>System decision</span><p>{project.decision}</p></div>
            <div><span>Measured outcome</span><p>{project.outcome}</p></div>
          </div>
        </div>
        <div className="dialog-footer-row">
          <div className="stack-list">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
          <a href={project.github} className="github-link">View repository <ExternalLink /></a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
