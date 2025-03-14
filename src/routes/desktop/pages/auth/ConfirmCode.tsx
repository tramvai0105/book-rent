import React, { useState } from 'react';

const ConfirmCode = () => {
    const [confirmationCode, setСonfirmationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/auth/verificate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ confirmationCode: confirmationCode }),
            });


            const result = await response.json();
            console.log(result)
            setSuccess(result.message);
        } catch (err) {
            setError('Ошибка: ' + err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Отправить данные</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="data">Код:</label>
                    <input
                        type="text"
                        id="confirmationCode"
                        value={confirmationCode}
                        onChange={(e) => setСonfirmationCode(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Отправка...' : 'Отправить'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
};

export default ConfirmCode;