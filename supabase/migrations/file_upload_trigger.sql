-- Function to handle new file notifications
CREATE OR REPLACE FUNCTION public.handle_new_file_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_owner_id UUID;
  project_name TEXT;
BEGIN
  -- Get project owner and name
  SELECT owner_id, name INTO project_owner_id, project_name
  FROM public.projects
  WHERE id = NEW.project_id;

  -- Only notify if the uploader is NOT the owner (e.g. client upload)
  -- Or if we want to notify owner regardless.
  -- Assuming auth.uid() is available.
  
  -- Insert notification
  INSERT INTO public.notifications (user_id, project_id, type, title, message, link)
  VALUES (
    project_owner_id,
    NEW.project_id,
    'file_upload',
    'Novo arquivo recebido',
    'Um novo arquivo foi adicionado ao projeto ' || project_name,
    '/project/' || NEW.project_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_file_upload ON public.files;
CREATE TRIGGER on_file_upload
  AFTER INSERT ON public.files
  FOR EACH ROW
  WHEN (NEW.status = 'pending') -- Only notify for pending files (usually uploads)
  EXECUTE FUNCTION public.handle_new_file_notification();
