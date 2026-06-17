export type DetailLevel = 'compact' | 'standard';

type JsonRecord = Record<string, unknown>;
type FieldSelector = string | {
  output: string;
  read: (source: JsonRecord) => unknown;
};

interface FieldSpec {
  itemsKey: string;
  compact: readonly string[];
  standard: readonly FieldSelector[];
}

const categoryIdsField: FieldSelector = {
  output: 'category_ids',
  read: (source) => {
    const categories = source.categories;
    if (!Array.isArray(categories)) return undefined;
    return categories
      .map((category) => asRecord(category).id)
      .filter((id): id is number => typeof id === 'number');
  },
};

const FIELD_SPECS: Record<'board' | 'list' | 'task', FieldSpec> = {
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
  task: {
    itemsKey: 'tasks',
    compact: ['id', 'name', 'list_id', 'status', 'assigned_user_ids', 'start_date_time', 'deadline_date_time'],
    standard: [
      'id',
      'name',
      'description',
      'list_id',
      'status',
      'assigned_user_ids',
      'start_date_time',
      'deadline_date_time',
      categoryIdsField,
      'updated_at',
    ],
  },
};

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
}

function pickDefined(record: JsonRecord): JsonRecord {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function pickFields(source: JsonRecord, fields: readonly string[]): JsonRecord {
  return Object.fromEntries(fields.map((field) => [field, source[field]]));
}

function fieldName(selector: FieldSelector): string {
  return typeof selector === 'string' ? selector : selector.output;
}

function fieldValue(source: JsonRecord, selector: FieldSelector): unknown {
  return typeof selector === 'string' ? source[selector] : selector.read(source);
}

function formatItem(item: unknown, spec: FieldSpec, detailLevel: DetailLevel): JsonRecord {
  const source = asRecord(item);
  if (detailLevel === 'standard') {
    return Object.fromEntries(spec.standard.map((field) => [fieldName(field), fieldValue(source, field) ?? null]));
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

export function formatTasksResponse(response: unknown, detailLevel: DetailLevel = 'compact') {
  return formatListResponse(response, FIELD_SPECS.task, detailLevel);
}
