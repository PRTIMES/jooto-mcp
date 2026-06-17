export type DetailLevel = 'compact' | 'standard';

type JsonRecord = Record<string, unknown>;
type FieldSelector = string | {
  output: string;
  read: (source: JsonRecord) => unknown;
};

interface FieldSpec {
  itemsKey: string;
  compact: readonly FieldSelector[];
  standard: readonly FieldSelector[];
}

function idArrayField(output: string, sourceKey: string): FieldSelector {
  return {
    output,
    read: (source) => {
      const items = source[sourceKey];
      if (!Array.isArray(items)) return undefined;
      return items
        .map((item) => asRecord(item).id)
        .filter((id): id is number => typeof id === 'number');
    },
  };
}

const senderIdField: FieldSelector = {
  output: 'sender_id',
  read: (source) => {
    const sender = asRecord(source.sender);
    return sender.id;
  },
};

const categoryIdsField = idArrayField('category_ids', 'categories');
const mentionedUserIdsField = idArrayField('mentioned_user_ids', 'mentioned_users');
const attachmentIdsField = idArrayField('attachment_ids', 'attachments');

const FIELD_SPECS: Record<'user' | 'boardMember' | 'board' | 'list' | 'task' | 'taskSearch' | 'comment', FieldSpec> = {
  user: {
    itemsKey: 'users',
    compact: ['id', 'name', 'display_name'],
    standard: ['id', 'name', 'display_name', 'email', 'role', 'created_at'],
  },
  boardMember: {
    itemsKey: 'users',
    compact: ['id', 'name', 'display_name', 'role'],
    standard: ['id', 'name', 'display_name', 'email', 'role'],
  },
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
  taskSearch: {
    itemsKey: 'tasks',
    compact: ['id', 'name', 'list_id', 'status', 'start_date_time', 'deadline_date_time'],
    standard: [
      'id',
      'name',
      'description',
      'list_id',
      'status',
      'start_date_time',
      'deadline_date_time',
      categoryIdsField,
      'updated_at',
    ],
  },
  comment: {
    itemsKey: 'comments',
    compact: ['id', 'content', senderIdField, 'created_at'],
    standard: [
      'id',
      'content',
      senderIdField,
      'created_at',
      'updated_at',
      mentionedUserIdsField,
      attachmentIdsField,
    ],
  },
};

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
}

function pickDefined(record: JsonRecord): JsonRecord {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
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

  return pickDefined(Object.fromEntries(spec.compact.map((field) => [fieldName(field), fieldValue(source, field)])));
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

export function formatUsersResponse(response: unknown, detailLevel: DetailLevel = 'compact') {
  return formatListResponse(response, FIELD_SPECS.user, detailLevel);
}

export function formatBoardMembersResponse(response: unknown, detailLevel: DetailLevel = 'compact') {
  return formatListResponse(response, FIELD_SPECS.boardMember, detailLevel);
}

export function formatListsResponse(response: unknown, detailLevel: DetailLevel = 'compact') {
  return formatListResponse(response, FIELD_SPECS.list, detailLevel);
}

export function formatTasksResponse(response: unknown, detailLevel: DetailLevel = 'compact') {
  return formatListResponse(response, FIELD_SPECS.task, detailLevel);
}

export function formatTaskSearchResponse(response: unknown, detailLevel: DetailLevel = 'compact') {
  return formatListResponse(response, FIELD_SPECS.taskSearch, detailLevel);
}

export function formatCommentsResponse(response: unknown, detailLevel: DetailLevel = 'compact') {
  return formatListResponse(response, FIELD_SPECS.comment, detailLevel);
}
