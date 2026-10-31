export type PublicEmployee = {
  id: number;
  full_name: string;
  specialty: string | null;
  photo_url: string | null;
  experience: string | null;
  worker_type: string; // master | assistant | driver (admin işə qəbulda seçir)
  months: number; // təcrübə ayla (saytda təcrübə zolağı və cəmi üçün); tarix yoxdursa 0
};
