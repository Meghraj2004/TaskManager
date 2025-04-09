import { Category } from "@/types";

interface TaskCategoriesProps {
  categories: Category[];
}

export default function TaskCategories({ categories }: TaskCategoriesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {categories.map((category) => (
        <div 
          key={category.id} 
          className={`bg-white rounded-lg shadow-sm p-5 border-t-4`}
          style={{ borderColor: category.color }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {category.name} ({category.count})
          </h2>
          <div 
            className="h-1 w-24 rounded mb-4"
            style={{ backgroundColor: category.color }}
          ></div>
          <p className="text-gray-600 text-sm">{category.description}</p>
        </div>
      ))}
    </div>
  );
}
