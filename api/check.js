export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone } = req.query;
    
    if (!phone || !/^[0-9]+$/.test(phone)) {
        return res.status(400).json({ error: 'Valid phone number is required (digits only)' });
    }

    try {
        const apiResponse = await fetchBDCourierAPI(phone);
        
        // Transform the API response to our format
        const transformedData = {
            status: apiResponse.status,
            phone,
            data: apiResponse.data,
            reports: apiResponse.reports || []
        };
        
        res.status(200).json(transformedData);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch courier data',
            details: error.response?.data || null
        });
    }
}

async function fetchBDCourierAPI(phone) {
    const apiKey = process.env.BD_COURIER_API_KEY;
    const apiUrl = 'https://bdcourier.com/api/courier-check';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ phone }),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const error = new Error(errorData?.message || `API request failed with status ${response.status}`);
        error.response = errorData;
        throw error;
    }

    return await response.json();
}