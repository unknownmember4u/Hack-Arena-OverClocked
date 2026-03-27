import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const JSON_PATH = resolve(process.cwd(), 'Data/property.json');

/** GET — fetch all properties from Data/property.json */
export async function GET() {
  try {
    const raw = readFileSync(JSON_PATH, 'utf8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

/** POST — add a new property to Data/property.json */
export async function POST(req: NextRequest) {
  try {
    const newProp = await req.json();

    const raw = readFileSync(JSON_PATH, 'utf8');
    const data = JSON.parse(raw);

    // Generate unique ID
    const maxNum = data.properties.reduce((max: number, p: { id: string }) => {
      const n = parseInt(p.id.replace('P', ''), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    newProp.id = 'P' + String(maxNum + 1).padStart(3, '0');

    // Ensure required fields
    newProp.is_for_sale = newProp.is_for_sale ?? false;
    newProp.selling_price = newProp.selling_price ?? null;
    newProp.rooms = newProp.rooms ?? null;
    newProp.commute_time_min = newProp.commute_time_min ?? 0;
    newProp.transport_modes = newProp.transport_modes ?? [];
    newProp.nearby = newProp.nearby ?? [];
    newProp.images = newProp.images ?? [];
    newProp.rating = newProp.rating ?? 0;
    newProp.available_from = newProp.available_from ?? 'Immediately';

    data.properties.push(newProp);

    writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json({ success: true, id: newProp.id, total: data.properties.length });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

/** DELETE — remove a property by id from Data/property.json */
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const raw = readFileSync(JSON_PATH, 'utf8');
    const data = JSON.parse(raw);

    const before = data.properties.length;
    data.properties = data.properties.filter((p: { id: string }) => p.id !== id);

    if (data.properties.length === before) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
    return NextResponse.json({ success: true, remaining: data.properties.length });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
