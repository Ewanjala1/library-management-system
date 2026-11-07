import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// NOTE: ISBNs below are sample identifiers for development only.
const genres = [
  { name: 'Fiction', description: 'Novels and literary fiction.' },
  { name: 'Science Fiction', description: 'Speculative and futuristic fiction.' },
  { name: 'Non-Fiction', description: 'Memoir, science writing and essays.' },
  { name: 'Technology', description: 'Software engineering and computer science.' },
  { name: 'History', description: 'Historical and world-history writing.' },
];

const books: {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  copiesAvailable: number;
  genre: string;
}[] = [
  // Fiction (4)
  { title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '9781000000011', publishedYear: 1958, copiesAvailable: 3, genre: 'Fiction' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9781000000028', publishedYear: 1813, copiesAvailable: 2, genre: 'Fiction' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9781000000035', publishedYear: 1925, copiesAvailable: 4, genre: 'Fiction' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9781000000042', publishedYear: 1960, copiesAvailable: 3, genre: 'Fiction' },

  // Science Fiction (4)
  { title: 'Dune', author: 'Frank Herbert', isbn: '9781000000059', publishedYear: 1965, copiesAvailable: 2, genre: 'Science Fiction' },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '9781000000066', publishedYear: 1984, copiesAvailable: 2, genre: 'Science Fiction' },
  { title: 'Foundation', author: 'Isaac Asimov', isbn: '9781000000073', publishedYear: 1951, copiesAvailable: 3, genre: 'Science Fiction' },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9781000000080', publishedYear: 1969, copiesAvailable: 1, genre: 'Science Fiction' },

  // Non-Fiction (4)
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '9781000000097', publishedYear: 2011, copiesAvailable: 5, genre: 'Non-Fiction' },
  { title: 'Educated', author: 'Tara Westover', isbn: '9781000000103', publishedYear: 2018, copiesAvailable: 3, genre: 'Non-Fiction' },
  { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot', isbn: '9781000000110', publishedYear: 2010, copiesAvailable: 2, genre: 'Non-Fiction' },
  { title: 'Silent Spring', author: 'Rachel Carson', isbn: '9781000000127', publishedYear: 1962, copiesAvailable: 2, genre: 'Non-Fiction' },

  // Technology (4)
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9781000000134', publishedYear: 2008, copiesAvailable: 4, genre: 'Technology' },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt and David Thomas', isbn: '9781000000141', publishedYear: 1999, copiesAvailable: 3, genre: 'Technology' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9781000000158', publishedYear: 2017, copiesAvailable: 2, genre: 'Technology' },
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen et al.', isbn: '9781000000165', publishedYear: 1990, copiesAvailable: 2, genre: 'Technology' },

  // History (2)
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9781000000172', publishedYear: 1997, copiesAvailable: 3, genre: 'History' },
  { title: 'The Silk Roads', author: 'Peter Frankopan', isbn: '9781000000189', publishedYear: 2015, copiesAvailable: 2, genre: 'History' },
];

async function main() {
  // Genres: upsert by unique name so re-running the seed is safe.
  const genreIds = new Map<string, number>();
  for (const g of genres) {
    const genre = await prisma.genre.upsert({
      where: { name: g.name },
      update: { description: g.description },
      create: g,
    });
    genreIds.set(genre.name, genre.id);
  }

  // Books: upsert by unique ISBN, linked to genre through genreId.
  for (const b of books) {
    const { genre, ...rest } = b;
    const genreId = genreIds.get(genre);
    if (genreId === undefined) throw new Error(`Unknown genre: ${genre}`);

    await prisma.book.upsert({
      where: { isbn: rest.isbn },
      update: { ...rest, genreId },
      create: { ...rest, genreId },
    });
  }

  // Users (one per role).
  const librarian = await prisma.user.upsert({
    where: { email: 'librarian@example.com' },
    update: {},
    create: { email: 'librarian@example.com', name: 'Lena Librarian', role: Role.LIBRARIAN },
  });
  const patron = await prisma.user.upsert({
    where: { email: 'patron@example.com' },
    update: {},
    create: { email: 'patron@example.com', name: 'Paul Patron', role: Role.PATRON },
  });

  // Stretch: a few sample reviews.
  const dune = await prisma.book.findUniqueOrThrow({ where: { isbn: '9781000000059' } });
  const cleanCode = await prisma.book.findUniqueOrThrow({ where: { isbn: '9781000000134' } });

  const reviews = [
    { bookId: dune.id, userId: patron.id, rating: 5, comment: 'A towering world-building achievement.' },
    { bookId: cleanCode.id, userId: patron.id, rating: 4, comment: 'Practical advice, a little dogmatic in places.' },
    { bookId: cleanCode.id, userId: librarian.id, rating: 5, comment: 'Recommended for every junior developer.' },
  ];
  for (const r of reviews) {
    await prisma.review.upsert({
      where: { bookId_userId: { bookId: r.bookId, userId: r.userId } },
      update: { rating: r.rating, comment: r.comment },
      create: r,
    });
  }

  const [genreCount, bookCount] = await Promise.all([prisma.genre.count(), prisma.book.count()]);
  console.log(`Seed complete: ${genreCount} genres, ${bookCount} books.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
