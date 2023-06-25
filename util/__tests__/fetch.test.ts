import fetcher from "../fetch";

describe('fetcher', () => {
  it('should return JSON data when given a valid URL', async () => {
    const url = 'https://jsonplaceholder.typicode.com/todos/1';
    const data = await fetcher(url);
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });

  it('should throw an error when given an invalid URL', async () => {
    const url = 'https://jsonplaceholder.typicode.com/invalid-url';
    await expect(fetcher(url)).rejects.toThrow(Error);
  });
});