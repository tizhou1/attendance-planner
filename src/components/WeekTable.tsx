import { useState, useEffect } from 'react';

function getMonday(date: Date): Date {
    // 0 = Sunday, 1 = Monday, ...
    const d = new Date(date);
    const day = d.getDay();
    // If already Monday, return as is
    if (day === 1) return d;
    // Otherwise, subtract days to get to previous Monday
    // If Sunday (0), go back 6 days
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

function getDefaultStartDate(): string {
    // Get today's date
    const today = new Date();
    // Go back 12 weeks (12 * 7 days)
    today.setDate(today.getDate() - 12 * 7);
    // Snap to the previous (or current) Monday
    const monday = getMonday(today);
    // Format as YYYY-MM-DD
    return monday.toISOString().slice(0, 10);
}

function WeekTable() {
    const [numWeeks, setNumWeeks] = useState(20);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    // Default start date is 12 weeks before today
    const [startDate, setStartDate] = useState<string>(getDefaultStartDate());

    // checked[week][day] is true if the checkbox for that week/day is checked
    const [checked, setChecked] = useState<boolean[][]>(
        () => Array.from({ length: 1 }, () => Array(days.length).fill(false))
    );

    // Ensure checked is always a 2D array of booleans sized [numWeeks][days.length]
    useEffect(() => {
        setChecked(prev => {
            const newChecked: boolean[][] = [];
            for (let i = 0; i < numWeeks; i++) {
                newChecked[i] = [];
                for (let j = 0; j < days.length; j++) {
                    newChecked[i][j] = prev[i]?.[j] ?? false;
                }
            }
            return newChecked;
        });
    }, [numWeeks, days.length]);

    const handleCheckboxChange = (weekIdx: number, dayIdx: number) => {
        setChecked(prev => {
            const updated = prev.map(arr => [...arr]);
            updated[weekIdx][dayIdx] = !updated[weekIdx][dayIdx];
            return updated;
        });
    };

    const handleCheckMidweek = (weekIdx: number) => {
        setChecked(prev => {
            const updated = prev.map(arr => [...arr]);
            // Check Tuesday (index 1), Wednesday (2), Thursday (3)
            [1, 2, 3].forEach(dayIdx => {
                updated[weekIdx][dayIdx] = true;
            });
            return updated;
        });
    };

    // Helper to get the date string for the Monday of a given week
    function getMondayOfWeek(weekIndex: number): string {
        if (!startDate) return '';
        const start = new Date(startDate);
        // startDate is always a Monday, so just add weeks
        start.setDate(start.getDate() + weekIndex * 7);
        return start.toISOString().slice(0, 10);
    }

    // Helper to count checked days for the past 12 weeks (including current), summing the top 8 weeks
    function getTop8CheckedInPast12Weeks(currentIdx: number): number {
        // Get indices for the last 12 weeks (including current)
        const startIdx = Math.max(0, currentIdx - 11);
        const relevantWeeks = checked.slice(startIdx, currentIdx + 1);
        // Count checked boxes for each week
        const weekCounts = relevantWeeks.map(week => week.filter(Boolean).length);
        // Sort descending and sum the top 8
        return weekCounts.sort((a, b) => b - a).slice(0, 8).reduce((a, b) => a + b, 0);
    }

    return (
        <div>
            <div style={{ marginBottom: 8 }}>
                <label>
                    Start date of first week:
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        style={{ marginLeft: 8 }}
                    />
                </label>
            </div>
            <label>
                Number of weeks:
                <input
                    type="number"
                    min={1}
                    value={numWeeks}
                    onChange={e => setNumWeeks(Math.max(1, Number(e.target.value)))}
                    style={{ marginLeft: 8 }}
                />
            </label>
            <table>
                <thead>
                <tr>
                    <th>Week</th>
                    {days.map((day) => (
                        <th key={day}>{day}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {Array.from({ length: numWeeks }).map((_, i) => {
                    const mondayDate = getMondayOfWeek(i);
                    let top8CheckedDisplay = null;
                    if (i >= 11) {
                        const top8Checked = getTop8CheckedInPast12Weeks(i);
                        top8CheckedDisplay = (
                            <td>
                                Top 8 of past 12 weeks: {top8Checked}
                            </td>
                        );
                    } else {
                        top8CheckedDisplay = (
                            <td style={{ color: '#888' }}>
                                Not enough data
                            </td>
                        );
                    }
                    return (
                        <tr key={i}>
                            <td>{mondayDate || `Week ${i + 1}`}</td>
                            {days.map((_, j) => (
                                <td key={j}>
                                    <input
                                        type="checkbox"
                                        checked={checked[i]?.[j] || false}
                                        onChange={() => handleCheckboxChange(i, j)}
                                    />
                                </td>
                            ))}
                            <td>
                                <button type="button" onClick={() => handleCheckMidweek(i)}>
                                    Check Tue/Wed/Thu
                                </button>
                            </td>
                            {top8CheckedDisplay}
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

export default WeekTable;
