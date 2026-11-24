import { Calendar } from "lucide-react";
import type { Experience } from "@/app/types/api";
import { formatDuration, formatPeriod } from "./format";

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <div className="relative pl-20 pb-12 last:pb-0">
      <div className="absolute left-6 top-2 w-5 h-5 bg-cyan-700 rounded-full border-4 border-white shadow-lg z-10"></div>

      <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-xl text-gray-900 mb-1">{experience.job}</h3>
            <p className="text-lg text-cyan-700 mb-2">{experience.company}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200">
            <Calendar size={16} />
            <span>{formatPeriod(experience.startDate, experience.endDate)}</span>
            <span className="text-gray-500">•</span>
            <span>{formatDuration(experience.startDate, experience.endDate)}</span>
          </div>
        </div>

        <p className="text-gray-600 mb-4 leading-relaxed whitespace-pre-line">{experience.description}</p>

        <div className="flex flex-wrap gap-2">
          {experience.tags.map((tag) => (
            <span key={tag.id} className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
