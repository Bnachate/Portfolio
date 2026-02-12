import { Calendar } from "lucide-react";

type IProps = {
  exp: {
    title: string
    period: string
    duration: string
    company: string
    description: string
    stack: string[]
  };
};

export function ExperienceCard({ exp }: IProps) {
  return (
    <div className="relative pl-20 pb-12 last:pb-0">
      <div className="absolute left-6 top-2 w-5 h-5 bg-cyan-600 rounded-full border-4 border-white shadow-lg z-10"></div>

      <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-xl text-gray-900 mb-1">
              {exp.title}
            </h3>
            <p className="text-lg text-cyan-600 mb-2">{exp.company}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200">
            <Calendar size={16} />
            <span>{exp.period}</span>
            <span className="text-gray-400">•</span>
            <span>{exp.duration}</span>
          </div>
        </div>

        <p className="text-gray-600 mb-4 leading-relaxed">
          { exp.description }
        </p>

        <div className="flex flex-wrap gap-2">
          { exp.stack.map((tech) => (
            <span
              key={tech}
              className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              { tech }
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
