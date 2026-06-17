export type DetailLevel = 'compact' | 'standard';

type JsonRecord = Record<string, unknown>;

const FIELD_SPECS = {
  board: {
    itemsKey: 'boards',
    compact: ['id', 'title'],
    standard: ['id', 'title', 'description', 'created_at'],
  },
  list: {
    itemsKey: 'lists',
    compact: ['id', 'name'],
    standard: ['id', 'name', 'order', 'color', 'auto_task_status'],
  },
} as const;

type FieldSpec = typeof FIELD_SPECS[keyof typeof FIELD_SPECS];

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
}

function pickDefined(record: JsonRecord): JsonRecord {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function pickFields(source: JsonRecord, fields: readonly string[]): JsonRecord {
  return Object.fromEntries(fields.map((field) => [field, source[field]]));
}

function formatItem(item: unknown, spec: FieldSpec, detailLevel: DetailLevel): JsonRecord {
  const source = asRecord(item);
  if (detailLevel === 'standard') {
    return Object.fromEntries(spec.standard.map((field) => [field, source[field] ?? null]));
  }

  return pickDefined(pickFields(source, spec.compact));
}

function formatListResponse(response: unknown, spec: FieldSpec, detailLevel: DetailLevel) {
  const source = asRecord(response);
  const items = source[spec.itemsKey];
  const list = Array.isArray(items) ? items : [];

  return {
    [spec.itemsKey]: list.map((item) => formatItem(item, spec, detailLevel)),
    meta: pickDefined({
      page: source.page,
      per_page: source.per_page,
      total: source.total,
      total_pages: source.total_pages,
      detail_level: detailLevel,
    }),
  };
}

export function formatBoardListResponse(response: unknown, detailLevel: DetailLevel = 'compact') {
  return formatListResponse(response, FIELD_SPECS.board, detailLevel);
}

export function formatListsResponse(response: unknown, detailLevel: DetailLevel = 'compact') {
  return formatListResponse(response, FIELD_SPECS.list, detailLevel);
}
