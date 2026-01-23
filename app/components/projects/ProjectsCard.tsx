import { ExternalLink, Github } from "lucide-react";
import { ImageWithFallback } from "../common/ImageWithFallback";

type IProps = {
    project: {
        id: number
        image: string
        title: string
        description: string
        technologies: string[]
        github: string
        demo: string
    }
}

export function ProjectsCard({ project }: IProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={project.image}
          alt={project.title}
          className="object-cover hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl mb-3 text-gray-900">{project.title}</h3>
        <p className="text-gray-600 mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-cyan-600 transition-colors"
          >
            <Github size={20} />
            <span>Code</span>
          </a>
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-cyan-600 transition-colors"
          >
            <ExternalLink size={20} />
            <span>Démo</span>
          </a>
        </div>
      </div>
    </div>
  );
}
