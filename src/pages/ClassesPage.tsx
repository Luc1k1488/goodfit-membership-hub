
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useLocation, useNavigate } from "react-router-dom";
import { FitnessClass } from "@/types";
import { ClassCard } from "@/components/ClassCard";

const ClassesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const gym_id = params.get("gym_id");
  const class_id = params.get("class_id");
  
  const { getGymById, getGymClasses } = useApp();
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const gym = gym_id ? getGymById(gym_id) : undefined;
  
  const handleClassSelect = (class_id: string, gym_id: string) => {
    navigate(`/booking/${gym_id}/${class_id}`);
  };
  
  useEffect(() => {
    const fetchClasses = async () => {
      if (gym_id) {
        setIsLoading(true);
        try {
          const classes = await getGymClasses(gym_id);
          setClasses(classes);
        } catch (error) {
          console.error("Error fetching classes:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchClasses();
  }, [gym_id, getGymClasses]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{gym ? `Классы в ${gym.name}` : "Все классы"}</h1>
      
      {isLoading ? (
        <p>Загрузка классов...</p>
      ) : classes.length === 0 ? (
        <p>Классы не найдены</p>
      ) : (
        <div className="space-y-4">
          {classes.map((fitnessClass) => (
            <div key={fitnessClass.id} onClick={() => handleClassSelect(fitnessClass.id, fitnessClass.gymid)}>
              <ClassCard fitnessClass={fitnessClass} gym={gym} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
