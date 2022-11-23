
create table products (
	id serial primary key,
	name varchar(255),
	price numeric(10,2),
	stock numeric(10,2),
	deleted_at timestamp default null
);

create table customers (
	id serial primary key,
	name varchar(255),
	telephone varchar(15),
	email varchar(255),
	deleted_at timestamp default null
);

create table purchases(
	id serial primary key,
	purchase_date timestamp without time zone default now(),
	customer_id integer,
	constraint fk_purchases__customers foreign key(customer_id) references customers(id),
	total_value numeric(10,2),
	deleted_at timestamp default null
);

create table purchase_items(
	id serial primary key,
	purchase_id integer,
	product_id integer,
	quantity numeric(10,2),
	unit_value numeric(10,2),
	constraint fk_purchase_items__purchases foreign key(purchase_id) references purchases(id),
	constraint fk_purchase_items__products foreign key(product_id) references products(id)
);

create function decrement_stock ()
returns trigger as
$$
begin
	update products set stock = (stock - new.quantity) WHERE id = new.product_id;
 	return NEW;
end;$$
language plpgsql;

create trigger after_insert_decrement_stock 
after insert on purchase_items for each row
execute procedure decrement_stock();

create function increment_stock()
returns trigger as
$$
begin
	update products set stock = (stock + old.quantity) where id = old.product_id;
	return new;
end;$$
language plpgsql;

create trigger after_delete_increment_stock
after delete on purchase_items for each row 
execute procedure increment_stock();