import { useState, useEffect, useCallback } from 'react';

/**
 * Deeply compares two values to determine if they are structurally different.
 * This avoids the performance penalties and key-ordering issues of JSON.stringify().
 */
export const hasDataChanged = (current, original) => {
    if (current === original) return false;
    if (current === null || original === null) return current !== original;

    if (Array.isArray(current) && Array.isArray(original)) {
        if (current.length !== original.length) return true;
        for (let i = 0; i < current.length; i++) {
            if (hasDataChanged(current[i], original[i])) return true;
        }
        return false;
    }

    if (typeof current === 'object' && typeof original === 'object') {
        const keys1 = Object.keys(current);
        const keys2 = Object.keys(original);
        if (keys1.length !== keys2.length) return true;

        for (let key of keys1) {
            if (hasDataChanged(current[key], original[key])) return true;
        }
        return false;
    }

    return current !== original;
};

/**
 * Reusable hook to manage form state and calculate dirtiness automatically.
 */
export const useFormState = (initialData = {}) => {
    const [originalData, setOriginalData] = useState(initialData);
    const [formData, setFormData] = useState(initialData);
    const [isDirty, setIsDirty] = useState(false);


    useEffect(() => {
        setOriginalData(initialData);
        setFormData(initialData);
        setIsDirty(false);

    }, [JSON.stringify(initialData)]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const next = { ...prev, [name]: val };
            setIsDirty(hasDataChanged(next, originalData));
            return next;
        });
    }, [originalData]);

    const handleCustomChange = useCallback((name, val) => {
        setFormData(prev => {
            const next = { ...prev, [name]: val };
            setIsDirty(hasDataChanged(next, originalData));
            return next;
        });
    }, [originalData]);

    // Resets the dirty state by marking the current form data as the new original data
    const syncSavedData = useCallback(() => {
        setOriginalData(formData);
        setIsDirty(false);
    }, [formData]);

    return {
        formData,
        setFormData,
        originalData,
        isDirty,
        setIsDirty,
        handleChange,
        handleCustomChange,
        syncSavedData
    };
};
