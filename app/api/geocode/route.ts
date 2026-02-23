import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json({ error: 'Missing lat/lon' }, { status: 400 });
    }

    // lat=0 lon=0 is our sentinel for "use IP-based location"
    if (lat === '0' && lon === '0') {
        return fallbackByIp();
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    try {
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`,
            { next: { revalidate: 300 } } // cache for 5 mins
        );
        const data = await res.json();

        if (data.status !== 'OK' || !data.results?.length) {
            // Fallback: use free IP-based location
            return fallbackByIp();
        }

        const components = data.results[0]?.address_components || [];
        const get = (type: string) =>
            components.find((c: { types: string[]; long_name: string }) =>
                c.types.includes(type)
            )?.long_name;

        const label =
            get('locality') ??
            get('administrative_area_level_2') ??
            get('administrative_area_level_1') ??
            get('country') ??
            'Your Location';

        return NextResponse.json({ location: label });
    } catch {
        return fallbackByIp();
    }
}

async function fallbackByIp() {
    try {
        const res = await fetch('https://ipapi.co/json/', {
            headers: { 'User-Agent': 'avanyaa-store/1.0' },
        });
        const data = await res.json();
        const label = data.city || data.region || data.country_name || 'India';
        return NextResponse.json({ location: label });
    } catch {
        return NextResponse.json({ location: 'India' });
    }
}
