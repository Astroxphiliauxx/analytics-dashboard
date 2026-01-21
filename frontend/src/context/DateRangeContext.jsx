import { createContext, useContext, useState } from 'react';

const DateRangeContext = createContext();

// Helper to get default dates (last 7 days)
const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
};

const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0];
};

export function DateRangeProvider({ children }) {
    // Draft state: Updated on calendar interaction (local only, no API)
    const [draftStartDate, setDraftStartDate] = useState(getDefaultStartDate);
    const [draftEndDate, setDraftEndDate] = useState(getDefaultEndDate);

    // Applied state: Updated only when "Apply" is clicked → triggers API
    const [appliedStartDate, setAppliedStartDate] = useState(getDefaultStartDate);
    const [appliedEndDate, setAppliedEndDate] = useState(getDefaultEndDate);

    // Handler for Apply button - copies draft to applied state
    const applyDateRange = () => {
        setAppliedStartDate(draftStartDate);
        setAppliedEndDate(draftEndDate);
    };

    // Reset to defaults
    const resetDateRange = () => {
        const start = getDefaultStartDate();
        const end = getDefaultEndDate();
        setDraftStartDate(start);
        setDraftEndDate(end);
        setAppliedStartDate(start);
        setAppliedEndDate(end);
    };

    return (
        <DateRangeContext.Provider value={{
            // Draft dates for UI
            draftStartDate,
            draftEndDate,
            setDraftStartDate,
            setDraftEndDate,
            // Applied dates for API calls
            appliedStartDate,
            appliedEndDate,
            // Actions
            applyDateRange,
            resetDateRange
        }}>
            {children}
        </DateRangeContext.Provider>
    );
}

export function useDateRange() {
    const context = useContext(DateRangeContext);
    if (!context) {
        throw new Error('useDateRange must be used within a DateRangeProvider');
    }
    return context;
}
