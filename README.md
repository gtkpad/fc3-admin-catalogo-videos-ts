## Como Rodar os Testes no Container

Para rodar os testes dentro do container utilizando o arquivo `docker-compose.dev.yaml`, siga os passos abaixo:

1. Certifique-se de que o Docker e o Docker Compose estão instalados no seu sistema.

2. Suba os serviços definidos no arquivo `docker-compose.dev.yaml`:

   ```bash
   docker-compose -f docker-compose.dev.yaml up -d
   ```

3. Acesse o container da aplicação:

   ```bash
    docker-compose -f docker-compose.dev.yaml exec -it app bash
   ```

4. Dentro do container, execute os testes com o seguinte comando:

   ```bash
   npm run test
   ```

5. Após a execução dos testes, você pode sair do container digitando `exit`.

6. Para parar os serviços, utilize o comando:

   ```bash
   docker-compose -f docker-compose.dev.yaml down
   ```
