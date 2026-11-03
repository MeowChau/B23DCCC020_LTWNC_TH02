import { memo, useCallback, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Icon } from '../../components/Icon';
import { useRoutineDispatch } from './RoutineContext';
import type { RoutineNameError } from './routineReducer';

interface RoutineCreateFormProps {
  validateName: (name: string) => RoutineNameError | undefined;
}

const RoutineCreateForm = memo(function RoutineCreateForm({ validateName }: RoutineCreateFormProps) {
  const dispatch = useRoutineDispatch();
  const [name, setName] = useState('');
  const [error, setError] = useState<RoutineNameError>();

  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setError(undefined);
  }, []);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nameError = validateName(name);
    setError(nameError);
    if (nameError) return;
    dispatch({ type: 'create', payload: { id: crypto.randomUUID(), name: name.trim() } });
    setName('');
  }, [dispatch, name, validateName]);

  return (
    <form className="routine-create-form" onSubmit={handleSubmit} noValidate aria-label="Tạo giáo án">
      <label htmlFor="routine-name">Tên giáo án</label>
      <div className="routine-form-fields">
        <input id="routine-name" type="text" placeholder="Ví dụ: Ngày ngực, Buổi tập toàn thân..."
          value={name} onChange={handleNameChange} aria-invalid={Boolean(error)}
          aria-describedby={error ? 'routine-create-error' : undefined} />
        <button className="primary-button" type="submit"><Icon name="plus" width="16" height="16" />Tạo</button>
      </div>
      {error && <p className="form-error" id="routine-create-error" role="alert">{error}</p>}
    </form>
  );
});

export default RoutineCreateForm;
