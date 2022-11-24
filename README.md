# Sobre o projeto

O projeto consiste em uma API REST simples para controle de vendas. A API aceita query strings para as requisições `GET` e objetos JSON para requisições `POST` e `PATCH`

# Como executar o projeto

Execute o script `database-structure.sql` em uma instância do Postgres para criar o banco de dados.

Configure um arquivo `.env` na raiz do projeto conforme o arquivo de exemplo.

Execute `yarn install` para instalar as dependências e em seguida execute `yarn start` para iniciar ou `yarn start:dev` para iniciar em modo watch. A API ficará disponível no endereço `http://localhost:3000`. Para executar os casos de teste execute `yarn test:cov`.

# Endpoints disponíveis

## Produtos

`GET /product` - Retorna uma listagem de produtos

### Parâmetros

`order` - Ordernação da listagem, pode ser utilizado qualquer um dos seguintes valores: `id`, `name`, `price`, `stock`.  
`direction` - Direção da ordenação, pode ser `ASC` ou `DESC`.  
`limit` - Limite de resultados a serem buscados, valor padrão é 10.  
`page` - Página dos resultados de acordo com a limitação(ex.: Com uma limitação de 1, a página 2 iria buscar os resultados de 11 a 20).

#### Exemplo de resposta:

    [
      {
        "id": 1,
        "name": "Ateste",
        "price": 20,
        "stock": -19010,
        "deletedAt": null
      },
      {
        "id": 2,
        "name": "Bteste",
        "price": 20,
        "stock": 328,
        "deletedAt": null
      }
    ]

`GET /product/:id` - Busca o produto de acordo com o ID informado em `:id`.

#### Exemplo de resposta:

    {
      "id": 2,
      "name": "Bteste",
      "price": 20,
      "stock": 328,
      "deletedAt": null
    }

`GET /product/best-sellers` - Retorna uma listagem dos produtos mais vendidos, pode ser especificado um filtro de data, mês ou ano, e também a direção da ordenação da lista.

### Parâmetros

`direction` - Direção da ordenação, pode ser `ASC` ou `DESC`.  
`year` - Filtra os produtos mais vendidos no ano informado.  
`month` - Mês e ano no formato YYYY-MM. Filtra os produtos mais vendidos no ano/mês informado. Sobrepõe o valor de `year`.  
`date` - Data no formado YYYY-MM-DD. Filtra os produtos mais vendidos na data informada. Sobrepões o valor de `month` e `year`.

#### Exemplo de resposta:

    [
      {
        "id": 2,
        "name": "Bteste",
        "price": "20.00",
        "stock": "328.00",
        "deleted_at": null,
        "soldunits": "70.00"
      },
      {
        "id": 1,
        "name": "Ateste",
        "price": "20.00",
        "stock": "-19010.00",
        "deleted_at": null,
        "soldunits": "10000.00"
      }
    ]

`POST /product` - Cria um produto e o retorna como resultado.

#### Exemplo de corpo para a requisição:

`name` - Obrigatório, tipo string.  
`price` - Obrigatório, tipo numérico.  
`stock` - Obrigatório, tipo numérico.

    {
      "name": "Bteste",
      "price": 20,
      "stock": 1000
    }

`PATCH /product/:id` - Atualiza o produto de acordo com o ID informado em `:id`. Retorna o código `404` caso não seja encontrado um produto.

#### Exemplo de corpo para a requisição:

`name` - Opcional, tipo string.  
`price` - Opcional, tipo numérico.  
`stock` - Opcional, tipo numérico.

    {
      "name": "Bteste",
      "price": 20,
      "stock": 1000
    }

`DELETE /product/:id` - Soft-delete de um produto de acordo com o ID informado em `:id`.

## Clientes

`GET /customer` - Retorna uma listagem de produtos

### Parâmetros

`order` - Ordernação da listagem, pode ser utilizado qualquer um dos seguintes valores: `id`, `name`, `telephone`, `email`.  
`direction` - Direção da ordenação, pode ser `ASC` ou `DESC`.  
`limit` - Limite de resultados a serem buscados, valor padrão é 10.  
`page` - Página dos resultados de acordo com a limitação(ex.: Com uma limitação de 1, a página 2 iria buscar os resultados de 11 a 20).

#### Exemplo de resposta:

    [
      {
        "id": 3,
        "name": "teste 3",
        "telephone": "+5511976726198",
        "email": "teste@teste.com",
        "deleted_at": null
      },
      {
        "id": 2,
        "name": "teste 2",
        "telephone": "+5511976726198",
        "email": "teste@teste.com",
        "deleted_at": null
      },
      {
        "id": 4,
        "name": "teste 4",
        "telephone": "+5511976726198",
        "email": "teste@teste.com",
        "deleted_at": null
      }
    ]

`GET /customer/:id` - Busca um cliente de acordo com o ID informado em `:id`.

#### Exemplo de resposta:

    {
      "id": 4,
      "name": "testerson 4",
      "telephone": "+5511976726198",
      "email": "teste@teste.com",
      "deletedAt": null
    }

`GET /customer/best-buyers` - Retorna uma listagem com os clientes que mais gastaram, pode ser especificado um filtro de data, mês ou ano, e também a direção da ordenação da lista.

### Parâmetros

`direction` - Direção da ordenação, pode ser `ASC` ou `DESC`.  
`year` - Filtra os clientes que mais gastaram no ano informado.  
`month` - Mês e ano no formato YYYY-MM. Filtra os clientes que mais gastaram no ano/mês informado. Sobrepõe o valor de `year`.  
`date` - Data no formado YYYY-MM-DD. Filtra os clientes que mais gastaram na data informada. Sobrepões o valor de `month` e `year`.

    [
      {
        "id": 3,
        "name": "test 3",
        "telephone": "+5511976726198",
        "email": "teste@teste.com",
        "deleted_at": null,
        "totalspent": "2000.00"
      },
      {
        "id": 2,
        "name": "test 2",
        "telephone": "+5511976726198",
        "email": "teste@teste.com",
        "deleted_at": null,
        "totalspent": "7200.00"
      },
      {
        "id": 4,
        "name": "test 4",
        "telephone": "+5511976726198",
        "email": "teste@teste.com",
        "deleted_at": null,
        "totalspent": "413240.00"
      }
    ]

`POST /customer` - Cria um cliente e o retorna como resultado.

#### Exemplo de corpo para a requisição:

`name` - Obrigatório, tipo string.  
`telephone` - Obrigatório, tipo string.  
`email` - Obrigatório, tipo string.

    {
      "name": "teste 4",
      "telephone": "+5511976726198",
      "email": "teste@teste.com"
    }

`PATCH /customer/:id` - Atualiza o cliente de acordo com o ID informado em `:id`. Retorna o código `404` caso não seja encontrado.

#### Exemplo de corpo para a requisição:

`name` - Opcional, tipo string.  
`telephone` - Opcional, tipo string.  
`email` - Opcional, tipo string.

    {
      "name": "teste 4",
      "telephone": "+5511976726198",
      "email": "teste@teste.com"
    }

`DELETE /customer/:id` - Soft-delete de um cliente de acordo com o ID informado em `:id`.

## Compras

`GET /purchase` - Retorna uma listagem de compras

### Parâmetros

`order` - Ordernação da listagem, pode ser utilizado qualquer um dos seguintes valores: `id`, `purchaseDate` - Data no formato YYYY-MM-DD, `totalValue`.  
`direction` - Direção da ordenação, pode ser `ASC` ou `DESC`.  
`limit` - Limite de resultados a serem buscados, valor padrão é 10.  
`page` - Página dos resultados de acordo com a limitação(ex.: Com uma limitação de 1, a página 2 iria buscar os resultados de 11 a 20).
`year` - Filtra os clientes que mais gastaram no ano informado.  
`month` - Mês e ano no formato YYYY-MM. Filtra os clientes que mais gastaram no ano/mês informado. Sobrepõe o valor de `year`.  
`date` - Data no formado YYYY-MM-DD. Filtra os clientes que mais gastaram na data informada. Sobrepões o valor de `month` e `year`.
`customerId` - Númerico, filtra as comprar de acordo com o ID do cliente informado.

#### Exemplo de resposta:

    [
      {
        "id": 18,
        "purchaseDate": "2022-11-23T23:23:00.000Z",
        "totalValue": "1400.00",
        "deletedAt": null,
        "customer": {
          "id": 2,
          "name": "testerson 2",
          "telephone": "+5511976726198",
          "email": "teste@teste.com",
          "deletedAt": null
        },
        "items": [
          {
            "id": 25,
            "quantity": "10.00",
            "unitValue": null
          },
          {
            "id": 26,
            "quantity": "60.00",
            "unitValue": null
          },
          {
            "id": 27,
            "quantity": "10.00",
            "unitValue": "20.00"
          },
          {
            "id": 28,
            "quantity": "60.00",
            "unitValue": "20.00"
          }
        ]
      }
    ]

`GET /purchase/:id` - Busca uma compra de acordo com o ID informado em `:id`.

#### Exemplo de resposta:

    {
      "id": 18,
      "purchaseDate": "2022-11-23T23:23:00.000Z",
      "totalValue": "1400.00",
      "deletedAt": null,
      "customer": {
        "id": 2,
        "name": "testerson 2",
        "telephone": "+5511976726198",
        "email": "teste@teste.com",
        "deletedAt": null
      },
      "items": [
        {
          "id": 25,
          "quantity": "10.00",
          "unitValue": null
        },
        {
          "id": 26,
          "quantity": "60.00",
          "unitValue": null
        },
        {
          "id": 27,
          "quantity": "10.00",
          "unitValue": "20.00"
        },
        {
          "id": 28,
          "quantity": "60.00",
          "unitValue": "20.00"
        }
      ]
    }

`POST /purchase` - Cria uma compra e a retorna como resultado.

#### Exemplo de corpo para a requisição:

`purchaseDate` - Obrigatório, data no formato YYYY-MM-DD.  
`customerId` - Opcional, ID do cliente. Retorna `404` caso o cliente não exista.  
`items` - Obrigatório, array de objetos contendo o ID do produto(`productId`) e a quantidade(`quantity`).

    {
      "purchaseDate": "2022-05-24",
      "customerId": 4,
      "items": [
        {
          "productId": 1,
          "quantity": 10000
        },
        {
          "productId": 2,
          "quantity": 602
        }
      ]
    }

`PATCH /purchase/:id` - Atualiza a compra de acordo com o ID informado em `:id`. Retorna o código `404` caso não seja encontrada.

#### Exemplo de corpo para a requisição:

`purchaseDate` - Opcional, data no formato YYYY-MM-DD.  
`customerId` - Opcional, ID do cliente. Retorna `404` caso o cliente não exista.  
`items` - Opcional, array de objetos contendo o ID do produto(`productId`) e a quantidade(`quantity`). Irá apagar os produtos anteriores e cadastrar os informados neste parâmetro

    {
      "purchaseDate": "2022-05-24",
      "customerId": 4,
      "items": [
        {
          "productId": 1,
          "quantity": 10000
        },
        {
          "productId": 2,
          "quantity": 602
        }
      ]
    }

`DELETE /purchase/:id` - Soft-delete de uma compra de acordo com o ID informado em `:id`.
