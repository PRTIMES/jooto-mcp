export type ListDetailLevel = 'compact' | 'standard';

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
}

function pickDefined(record: JsonRecord): JsonRecord {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function formatBoard(board: unknown, detailLevel: ListDetailLevel): JsonRecord {
  const source = asRecord(board);
  if (detailLevel === 'standard') {
    return {
      id: source.id ?? null,
      title: source.title ?? null,
      description: source.description ?? null,
      created_at: source.created_at ?? null,
    };
  }

  return pickDefined({
    id: source.id,
    title: source.title,
  });
}

export function formatBoardListResponse(response: unknown, detailLevel: ListDetailLevel = 'compact') {
  const source = asRecord(response);
  const boards = Array.isArray(source.boards) ? source.boards : [];

  return {
    boards: boards.map((board) => formatBoard(board, detailLevel)),
    meta: pickDefined({
      page: source.page,
      per_page: source.per_page,
      total: source.total,
      total_pages: source.total_pages,
      detail_level: detailLevel,
    }),
  };
}
