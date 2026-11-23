import { ExternalLink, Github } from "lucide-react";
import { ImageWithFallback } from "../common/ImageWithFallback";
import type { Project } from "@/app/types/api";

const linkClass = "flex items-center gap-2 text-gray-700 hover:text-cyan-600 transition-colors";

export function ProjectsCard({ project }: { project: Project }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={project.projectImageUrl}
          alt={project.title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl mb-3 text-gray-900">{project.title}</h3>
        <p className="text-gray-600 mb-4 whitespace-pre-line">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <span key={tag.id} className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm">
              {tag.name}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <Github size={20} />
              <span>Code</span>
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <ExternalLink size={20} />
              <span>Démo</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
